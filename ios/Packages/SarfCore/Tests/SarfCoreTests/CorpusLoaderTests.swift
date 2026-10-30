// The corpus loader and its stand-in conjugator, on corpora small enough to read.
// The bundled files are checked in StandInTests.

import Foundation
import Testing
@testable import SarfCore

/// Builds corpus files the way the exporter writes them. Each chart's words are
/// "<tense>:<voice>:<mood>:<slot>", so a test can see which chart it reached.
enum TinyCorpus {
    static let rootsData = Data("the lexicon".utf8)

    static func marker(_ shape: ChartShape, _ slot: String) -> String {
        "\(shape.tense.rawValue):\(shape.voice.rawValue):\(shape.mood?.rawValue ?? "-"):\(slot)"
    }

    static func chart(_ shape: ChartShape, words: [String: Any]? = nil, absent: Bool = false) -> [String: Any] {
        let slots = shape.tense.slots.map(\.rawValue)
        let written = words ?? Dictionary(uniqueKeysWithValues: slots.map { ($0, marker(shape, $0) as Any) })
        return ["tense": shape.tense.rawValue, "voice": shape.voice.rawValue,
                "mood": shape.mood?.rawValue ?? NSNull(), "words": absent ? NSNull() : written]
    }

    static var charts: [[String: Any]] { ChartShape.all.map { chart($0) } }

    static var nouns: [String: Any] { ["ismFail": "فاعل", "ismMaful": NSNull(), "masdar": "مصدر"] }

    static func block(citation: Any = "كَتَبَ يَكْتُبُ", derived: [String: Any] = nouns, charts: [[String: Any]] = charts) -> [String: Any] {
        ["citation": citation, "derived": derived, "charts": charts]
    }

    /// The reference patterns: Form I with the bāb au, and Form II.
    static func wazn(_ entries: [(form: String, bab: Any)] = [("I", "au"), ("II", NSNull())], block: [String: Any] = block()) -> [[String: Any]] {
        entries.map { ["form": $0.form, "bab": $0.bab, "block": block] }
    }

    /// One root, كتب, in the forms given.
    static func data(forms: [String: [String: Any]] = ["II": block()], wazn: [[String: Any]] = wazn()) throws -> Data {
        let file: [String: Any] = ["rootsHash": contentHash(of: rootsData), "roots": ["كتب": forms], "wazn": wazn]
        return try JSONSerialization.data(withJSONObject: file)
    }

    static func service(_ corpus: Data) throws -> ConjugationService {
        try ConjugationService.load(rootsData: rootsData, corpusData: corpus)
    }
}

private let katab = testRoot("كتب", .salim, forms: [.ii: true, .ix: true])

private func spec(_ root: Root, _ form: VerbForm, _ shape: ChartShape) -> ConjugationSpec {
    ConjugationSpec(root: root, form: form, shape: shape)
}

@Suite("Corpus stand-in")
struct CorpusStandInTests {
    @Test func answersWithTheWordsTheCorpusHolds() throws {
        let service = try TinyCorpus.service(TinyCorpus.data())
        for shape in ChartShape.all {
            #expect(service.conjugate(spec(katab, .ii, shape), slot: shape.tense.slots[0])
                    == TinyCorpus.marker(shape, shape.tense.slots[0].rawValue))
        }
    }

    /// The chart is chosen by its whole shape: tense, voice and mood.
    @Test func chartsAreToldApartByVoiceAndMood() throws {
        let service = try TinyCorpus.service(TinyCorpus.data())
        #expect(service.conjugate(spec(katab, .ii, Shapes.mudariPassiveRaf), slot: .p3ms) == "mudari:majhul:raf:3ms")
        #expect(service.conjugate(spec(katab, .ii, .mudariMalumRaf), slot: .p3ms) == "mudari:malum:raf:3ms")
    }

    @Test func aChartWrittenNullHasNoWords() throws {
        var charts = TinyCorpus.charts
        charts[1] = TinyCorpus.chart(Shapes.madiPassive, absent: true)
        let service = try TinyCorpus.service(TinyCorpus.data(forms: ["II": TinyCorpus.block(charts: charts)]))
        #expect(service.conjugate(spec(katab, .ii, Shapes.madiPassive), slot: .p3ms) == nil)
        #expect(service.fullTable(spec(katab, .ii, Shapes.madiPassive)) == nil)
        #expect(service.conjugate(spec(katab, .ii, Shapes.madiActive), slot: .p3ms) == "madi:malum:-:3ms")
    }

    @Test func aSlotWrittenNullHasNoWord() throws {
        var words = Dictionary(uniqueKeysWithValues: PronounSlot.allCases.map { ($0.rawValue, "w" as Any) })
        words["3fp"] = NSNull()
        var charts = TinyCorpus.charts
        charts[0] = TinyCorpus.chart(Shapes.madiActive, words: words)
        let service = try TinyCorpus.service(TinyCorpus.data(forms: ["II": TinyCorpus.block(charts: charts)]))
        #expect(service.conjugate(spec(katab, .ii, Shapes.madiActive), slot: .p3fp) == nil)
        #expect(service.conjugate(spec(katab, .ii, Shapes.madiActive), slot: .p3fs) == "w")
        #expect(service.fullTable(spec(katab, .ii, Shapes.madiActive))?.count == 13)
    }

    @Test func derivedNounsAreAnsweredOrNil() throws {
        let service = try TinyCorpus.service(TinyCorpus.data())
        #expect(service.derivedNoun(katab, form: .ii, type: .ismFail) == "فاعل")
        #expect(service.derivedNoun(katab, form: .ii, type: .masdar) == "مصدر")
        // Written null in the corpus. The service refuses it first anyway when the verb is intransitive.
        #expect(service.derivedNoun(katab, form: .ii, type: .ismMaful) == nil)
    }

    /// Form IX has no chart, so its name is the corpus's citation.
    @Test func formIXIsNamedByTheCorpus() throws {
        let nine = TinyCorpus.block(citation: "اِحْمَرَّ يَحْمَرُّ", charts: ChartShape.all.map { TinyCorpus.chart($0, absent: true) })
        let service = try TinyCorpus.service(TinyCorpus.data(forms: ["IX": nine]))
        #expect(service.citation(katab, form: .ix) == "اِحْمَرَّ يَحْمَرُّ")
    }

    /// A citation is built from the past and present words. The corpus's own is
    /// only read for Form IX, and null there means the form has no name.
    @Test func aNullCitationIsNoCitation() throws {
        let nine = TinyCorpus.block(citation: NSNull(), charts: ChartShape.all.map { TinyCorpus.chart($0, absent: true) })
        let service = try TinyCorpus.service(TinyCorpus.data(forms: ["IX": nine]))
        #expect(service.citation(katab, form: .ix) == nil)
    }

    @Test func aCitationIsTheTwoWordsTheChartsGive() throws {
        let service = try TinyCorpus.service(TinyCorpus.data())
        #expect(service.citation(katab, form: .ii) == "madi:malum:-:3ms mudari:malum:raf:3ms")
    }

    /// Lookups the corpus can't answer are nil, not a guess.
    @Test func aRootOrFormTheCorpusLacksIsNil() throws {
        let service = try TinyCorpus.service(TinyCorpus.data())
        let other = testRoot("خرج", .salim, forms: [.ii: true])
        #expect(service.conjugate(spec(other, .ii, Shapes.madiActive), slot: .p3ms) == nil)
        #expect(service.derivedNoun(other, form: .ii, type: .ismFail) == nil)
        // The corpus above has Form II only, and the root is used in IX.
        #expect(service.derivedNoun(katab, form: .ix, type: .ismFail) == nil)
    }
}

@Suite("Corpus stand-in: patterns")
struct CorpusPatternTests {
    let service: ConjugationService

    init() throws { service = try TinyCorpus.service(TinyCorpus.data()) }

    @Test func formIIsLookedUpByItsBab() {
        #expect(service.waznOf(form: .i, shape: .madiMalum, slot: .p3ms, bab: .au) == "madi:malum:-:3ms")
        #expect(service.waznOf(form: .i, shape: .madiMalum, slot: .p3ms, bab: .ai) == nil)
    }

    /// A Form I pattern needs its bāb, rather than show the wrong one.
    @Test func formIWithoutABabIsNil() {
        #expect(service.waznOf(form: .i, shape: .madiMalum, slot: .p3ms, bab: nil) == nil)
        #expect(service.waznCitation(form: .i, bab: nil) == nil)
    }

    /// The other forms don't have a bāb, so one passed in changes nothing.
    @Test func otherFormsIgnoreTheBab() {
        let plain = service.waznOf(form: .ii, shape: .madiMalum, slot: .p3ms, bab: nil)
        #expect(plain == "madi:malum:-:3ms")
        #expect(service.waznOf(form: .ii, shape: .madiMalum, slot: .p3ms, bab: .au) == plain)
    }

    @Test func derivedNounsAndCitationComeFromThePattern() {
        #expect(service.waznOfDerived(form: .ii, type: .ismFail, bab: nil) == "فاعل")
        #expect(service.waznCitation(form: .ii, bab: nil) == "madi:malum:-:3ms mudari:malum:raf:3ms")
    }

    /// The stand-in tells the reference root by its letters, so no lexicon root
    /// may have them (StandInTests checks that).
    @Test func theReferenceRootIsToldByItsLetters() throws {
        let service = try TinyCorpus.service(TinyCorpus.data(forms: [:]))
        let reference = testRoot("فعل", .salim, forms: [.ii: true])
        #expect(service.conjugate(spec(reference, .ii, Shapes.madiActive), slot: .p3ms) == "madi:malum:-:3ms")
        #expect(service.conjugate(spec(katab, .ii, Shapes.madiActive), slot: .p3ms) == nil)
    }
}

@Suite("Corpus loader")
struct CorpusLoaderTests {
    private func loadFails(_ corpus: Data, mentioning text: String, sourceLocation: SourceLocation = #_sourceLocation) {
        do {
            _ = try TinyCorpus.service(corpus)
            Issue.record("the corpus loaded", sourceLocation: sourceLocation)
        } catch {
            #expect("\(error)".contains(text), "\(error)", sourceLocation: sourceLocation)
        }
    }

    @Test func theBaselineLoads() throws {
        _ = try TinyCorpus.service(TinyCorpus.data())
    }

    @Test func aFormMustHaveAllNineCharts() throws {
        let block = TinyCorpus.block(charts: Array(TinyCorpus.charts.dropLast()))
        loadFails(try TinyCorpus.data(forms: ["II": block]), mentioning: "all nine charts, but this has 8")
    }

    @Test func aChartCannotAppearTwice() throws {
        let block = TinyCorpus.block(charts: Array(TinyCorpus.charts.dropLast()) + [TinyCorpus.charts[0]])
        loadFails(try TinyCorpus.data(forms: ["II": block]), mentioning: "appears twice")
    }

    @Test func aSlotOfAnotherTenseIsRefused() throws {
        // 3ms is not a command slot.
        var words = Dictionary(uniqueKeysWithValues: Tense.amr.slots.map { ($0.rawValue, "w" as Any) })
        words["3ms"] = "w"
        var charts = TinyCorpus.charts
        charts[8] = TinyCorpus.chart(Shapes.amr, words: words)
        loadFails(try TinyCorpus.data(forms: ["II": TinyCorpus.block(charts: charts)]), mentioning: "\"3ms\" is not a slot of the amr chart")
    }

    @Test func aChartMustWriteEverySlot() throws {
        var words = Dictionary(uniqueKeysWithValues: PronounSlot.allCases.map { ($0.rawValue, "w" as Any) })
        words["1p"] = nil
        var charts = TinyCorpus.charts
        charts[0] = TinyCorpus.chart(Shapes.madiActive, words: words)
        loadFails(try TinyCorpus.data(forms: ["II": TinyCorpus.block(charts: charts)]), mentioning: "must write all 14 slots")
    }

    /// A key missing from the file means an out-of-date export. It is never read as "none".
    @Test func aMissingMoodIsAnError() throws {
        var charts = TinyCorpus.charts
        charts[0].removeValue(forKey: "mood")
        loadFails(try TinyCorpus.data(forms: ["II": TinyCorpus.block(charts: charts)]), mentioning: "mood")
    }

    @Test func everyNounTypeMustBeWritten() throws {
        loadFails(try TinyCorpus.data(forms: ["II": TinyCorpus.block(derived: ["ismFail": "x", "masdar": "x"])]),
                  mentioning: "every noun type must be written")
    }

    @Test func anUnknownNounTypeIsRefused() throws {
        let nouns: [String: Any] = ["ismFail": "x", "ismMaful": "x", "zarf": "x"]
        loadFails(try TinyCorpus.data(forms: ["II": TinyCorpus.block(derived: nouns)]), mentioning: "unknown noun type \"zarf\"")
    }

    @Test func noCitationIsNullNotEmpty() throws {
        loadFails(try TinyCorpus.data(forms: ["II": TinyCorpus.block(citation: "")]), mentioning: "should be null")
    }

    @Test func anUnknownFormIsRefused() throws {
        loadFails(try TinyCorpus.data(forms: ["XI": TinyCorpus.block()]), mentioning: "unknown form \"XI\"")
    }

    @Test func formIPatternsNeedABab() throws {
        loadFails(try TinyCorpus.data(wazn: TinyCorpus.wazn([("I", NSNull())])), mentioning: "only Form I has a bāb")
    }

    @Test func otherPatternsHaveNoBab() throws {
        loadFails(try TinyCorpus.data(wazn: TinyCorpus.wazn([("II", "au")])), mentioning: "only Form I has a bāb")
    }

    @Test func aPatternCannotAppearTwice() throws {
        loadFails(try TinyCorpus.data(wazn: TinyCorpus.wazn([("I", "au"), ("I", "au")])), mentioning: "appears twice")
    }
}

@Suite("Corpus hash")
struct CorpusHashTests {
    /// The standard SHA-256 test vectors.
    @Test func matchesKnownDigests() {
        #expect(contentHash(of: Data()) == "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
        #expect(contentHash(of: Data("abc".utf8)) == "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
    }

    @Test func aCorpusFromAnotherLexiconIsStale() throws {
        let corpus = try TinyCorpus.data()
        let changed = TinyCorpus.rootsData + Data(" ".utf8)
        #expect(throws: ConjugationError.corpusStale(expected: contentHash(of: TinyCorpus.rootsData), actual: contentHash(of: changed))) {
            try ConjugationService.load(rootsData: changed, corpusData: corpus)
        }
    }

    @Test func theBundledFilesAgree() throws {
        _ = try ConjugationService.load()
    }

    /// One byte added to the bundled lexicon is enough.
    @Test func theBundledCorpusIsStaleForAnEditedLexicon() throws {
        let roots = try resource("roots") + Data("\n".utf8)
        #expect(throws: ConjugationError.self) {
            try ConjugationService.load(rootsData: roots, corpusData: resource("golden-corpus"))
        }
    }
}
