// Tests for the conjugation service: what it sends to a conjugator, what it
// stops before one, and that its checks agree with the exported corpus.
//
// The conjugators here are stand-ins, so these tests are about the service only.

import Foundation
import Testing
@testable import SarfCore

private let katab = testRoot("كتب", .salim, forms: [.i: true, .ii: true, .vi: false, .vii: false, .viii: true, .ix: false])
private let kharaj = testRoot("خرج", .salim, forms: [.i: false, .ii: true])
private let daa = testRoot("دعو", .naqisWaw, forms: [.i: true, .viii: true])
private let qaal = testRoot("قول", .ajwafWaw, forms: [.i: true])
private let baa = testRoot("بيع", .ajwafYa, forms: [.i: true])
private let waqaa = testRoot("وقي", .lafifMafruq, forms: [.i: true])

private func spec(_ root: Root, _ form: VerbForm, _ shape: ChartShape) -> ConjugationSpec {
    ConjugationSpec(root: root, form: form, shape: shape)
}

@Suite("Form facts")
struct FormFactsTests {
    /// Only Form IX has no words; Forms VII and IX have no passive.
    @Test func conjugatesAndPassiveByForm() throws {
        let service = try Rig().service
        for form in VerbForm.allCases {
            #expect(service.conjugates(form) == (form != .ix), "\(form)")
            #expect(form.facts.hasMajhul == (form != .vii && form != .ix), "\(form)")
        }
    }

    @Test func iftiaalLettersAreTheSevenThatSwallowTheTaa() {
        #expect(iftiaalAssimilatingFaa == Set("دذزصضطظ".unicodeScalars))
    }
}

@Suite("hasPassive")
struct HasPassiveTests {
    let service: ConjugationService

    init() throws { service = try Rig().service }

    @Test func aVerbWithAnObjectInAFormWithAPassive() {
        #expect(service.hasPassive(katab, form: .i))
        #expect(service.hasPassive(katab, form: .viii))
    }

    /// خَرَجَ takes no object in Form I, but does in Form II (خَرَّجَ).
    @Test func aVerbWithoutAnObjectHasNone() {
        #expect(!service.hasPassive(kharaj, form: .i))
        #expect(service.hasPassive(kharaj, form: .ii))
    }

    /// Form VII is recorded as taking an object here, to show the form decides.
    @Test func formVIIHasNoneEvenWithAnObject() {
        let root = testRoot("كسر", .salim, forms: [.vii: true])
        #expect(!service.hasPassive(root, form: .vii))
    }

    @Test func aFormTheRootDoesNotUseHasNone() {
        #expect(!service.hasPassive(kharaj, form: .iii))
    }
}

@Suite("Checks before a conjugator")
struct PreconditionTests {
    let rig: Rig

    init() throws { rig = try Rig() }

    private func asks(_ root: Root, _ form: VerbForm, _ shape: ChartShape, _ slot: PronounSlot = .p3ms) -> String? {
        rig.service.conjugate(spec(root, form, shape), slot: slot)
    }

    @Test func aWordThatCanExistReachesTheConjugator() {
        #expect(asks(katab, .i, Shapes.madiActive) == "salim:I:madi:malum:3ms")
        #expect(rig.stub(.salim).calls == ["conjugate"])
    }

    @Test func aFormTheRootDoesNotUseIsNil() {
        #expect(asks(kharaj, .iii, Shapes.madiActive) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    @Test func formIXIsNil() {
        #expect(asks(katab, .ix, Shapes.madiActive) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    @Test func aPassiveOfAVerbWithoutAnObjectIsNil() {
        #expect(asks(kharaj, .i, Shapes.madiPassive) == nil)
        #expect(asks(kharaj, .i, Shapes.mudariPassiveRaf) == nil)
        #expect(asks(kharaj, .i, Shapes.madiActive) != nil)
        #expect(rig.stub(.salim).calls == ["conjugate"])
    }

    @Test func aPassiveInFormVIIIsNil() {
        let root = testRoot("كسر", .salim, forms: [.vii: true])
        #expect(asks(root, .vii, Shapes.madiPassive) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    /// دعو in Form VIII would be اِدَّعَى; no engine writes that yet.
    @Test func formVIIIWithATaaSwallowingFirstLetterIsNil() {
        #expect(asks(daa, .viii, Shapes.madiActive) == nil)
        #expect(asks(daa, .i, Shapes.madiActive) != nil)
        #expect(rig.stub(.naqis).calls == ["conjugate"])
    }

    @Test func formVIIIWithAnotherFirstLetterGoesThrough() {
        #expect(asks(katab, .viii, Shapes.madiActive) != nil)
    }

    @Test func theCommandHasSixSlotsAndThePastHasFourteen() {
        let command = Tense.amr.slots
        #expect(command.count == 6)
        for slot in PronounSlot.allCases {
            let word = asks(katab, .i, Shapes.amr, slot)
            #expect((word != nil) == command.contains(slot), "\(slot)")
            #expect((asks(katab, .i, Shapes.madiActive, slot) != nil), "\(slot)")
        }
    }
}

@Suite("Routing")
struct RoutingTests {
    let rig: Rig

    init() throws { rig = try Rig() }

    private func answer(_ root: Root) -> String? {
        rig.service.conjugate(spec(root, .i, Shapes.madiActive), slot: .p3ms)
    }

    @Test func eachRootGoesToItsGroup() {
        #expect(answer(katab) == "salim:I:madi:malum:3ms")
        #expect(answer(testRoot("مدد", .mudaaf, forms: [.i: true])) == "mudaaf:I:madi:malum:3ms")
        #expect(answer(testRoot("أخذ", .mahmuz, forms: [.i: true])) == "mahmuz:I:madi:malum:3ms")
        #expect(answer(testRoot("رمي", .naqisYa, forms: [.i: true])) == "naqis:I:madi:malum:3ms")
    }

    /// One conjugator serves both weak letters.
    @Test func bothTypesOfAGroupGoToTheSameConjugator() {
        #expect(answer(qaal) == "ajwaf:I:madi:malum:3ms")
        #expect(answer(baa) == "ajwaf:I:madi:malum:3ms")
        #expect(rig.stub(.ajwaf).calls == ["conjugate", "conjugate"])
    }

    @Test func aGroupWithNoEngineAnswersNilEverywhere() {
        let service = rig.service
        #expect(!service.hasEngine(.lafifMafruq))
        #expect(!service.hasEngine(.lafifMaqrun))
        #expect(answer(waqaa) == nil)
        #expect(service.fullTable(spec(waqaa, .i, Shapes.madiActive)) == nil)
        #expect(service.derivedNoun(waqaa, form: .i, type: .ismFail) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    @Test func everyOtherTypeHasAnEngine() {
        for type in VerbType.allCases {
            #expect(rig.service.hasEngine(type) == (type.group != .lafif), "\(type)")
        }
    }
}

@Suite("fullTable")
struct FullTableTests {
    @Test func buildsTheChartInOneCall() throws {
        let rig = try Rig()
        let table = try #require(rig.service.fullTable(spec(katab, .i, Shapes.madiActive)))
        #expect(Set(table.keys) == Set(Tense.madi.slots))
        #expect(rig.stub(.salim).calls == ["table"])
    }

    @Test func theCommandTableHasSixRows() throws {
        let rig = try Rig()
        let table = try #require(rig.service.fullTable(spec(katab, .i, Shapes.amr)))
        #expect(table.count == 6)
    }

    @Test func aChartThatCannotExistIsNilWithoutAskingTheConjugator() throws {
        let rig = try Rig()
        #expect(rig.service.fullTable(spec(kharaj, .i, Shapes.madiPassive)) == nil)
        #expect(rig.service.fullTable(spec(katab, .ix, Shapes.madiActive)) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    @Test func aTableWithNoWordsIsNil() throws {
        let rig = try Rig(emptyTables: [.salim])
        #expect(rig.service.fullTable(spec(katab, .i, Shapes.madiActive)) == nil)
        #expect(rig.stub(.salim).calls == ["table"])
    }

    /// The default builds the table from `conjugate`, one slot at a time, and
    /// leaves out a slot that has no word.
    @Test func theDefaultTableSkipsSlotsWithNoWord() {
        struct HalfConjugator: VerbTypeConjugator {
            func conjugate(_ spec: ConjugationSpec, slot: PronounSlot) -> String? {
                slot == .p1s ? nil : "w"
            }
            func derivedNoun(root: Root, form: VerbForm, type: DerivedNounType) -> String? { nil }
        }
        let table = HalfConjugator().conjugateTable(spec(katab, .i, Shapes.madiActive))
        #expect(table.count == 13)
        #expect(table[.p1s] == nil)
    }
}

@Suite("derivedNoun")
struct DerivedNounTests {
    let rig: Rig

    init() throws { rig = try Rig() }

    @Test func comesFromTheConjugator() {
        #expect(rig.service.derivedNoun(katab, form: .ii, type: .ismFail) == "salim:II:ismFail")
        #expect(rig.service.derivedNoun(katab, form: .ii, type: .ismMaful) == "salim:II:ismMaful")
    }

    @Test func noIsmMafulWithoutAnObject() {
        #expect(rig.service.derivedNoun(kharaj, form: .i, type: .ismMaful) == nil)
        #expect(rig.service.derivedNoun(kharaj, form: .i, type: .ismFail) != nil)
        #expect(rig.service.derivedNoun(kharaj, form: .ii, type: .ismMaful) != nil)
    }

    /// A Form I masdar is the one the lexicon recorded, so the conjugator isn't asked.
    @Test func aFormIMasdarIsTheRecordedOne() {
        #expect(rig.service.derivedNoun(katab, form: .i, type: .masdar) == "مَصْدَر")
        #expect(rig.stub(.salim).calls.isEmpty)
    }

    @Test func aFormIMasdarThatWasNotRecordedIsNil() {
        let root = Root(
            radicals: katab.radicals, verbType: .salim,
            forms: [.i: RootForm(bab: .au, isTransitive: true, masdar: nil, faaDrops: nil, gloss: "x", english: nil)])
        #expect(rig.service.derivedNoun(root, form: .i, type: .masdar) == nil)
        #expect(rig.stub(.salim).calls.isEmpty)
    }

    @Test func aMazeedMasdarComesFromTheConjugator() {
        #expect(rig.service.derivedNoun(katab, form: .ii, type: .masdar) == "salim:II:masdar")
    }

    @Test func aFormTheRootDoesNotUseIsNil() {
        #expect(rig.service.derivedNoun(kharaj, form: .iii, type: .ismFail) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    @Test func formVIIIWithATaaSwallowingFirstLetterIsNil() {
        #expect(rig.service.derivedNoun(daa, form: .viii, type: .ismFail) == nil)
        #expect(rig.service.derivedNoun(katab, form: .viii, type: .ismFail) != nil)
    }

    /// No engine means no nouns, even a masdar the lexicon recorded.
    @Test func aTypeWithNoEngineHasNoNounsAtAll() {
        #expect(rig.service.derivedNoun(waqaa, form: .i, type: .masdar) == nil)
    }
}

@Suite("Wiring")
struct WiringTests {
    @Test func aMissingConjugatorIsRefused() {
        let stubs = Dictionary(uniqueKeysWithValues: VerbTypeGroup.allCases
            .filter { engineBacking(for: $0) != .unbuilt && $0 != .ajwaf }
            .map { ($0, StubConjugator($0.rawValue) as any VerbTypeConjugator) })
        #expect(throws: ConjugationError.backingMismatch(group: .ajwaf, declared: .corpus, registered: false)) {
            try ConjugationService(conjugators: stubs)
        }
    }

    @Test func aConjugatorForAnUnbuiltGroupIsRefused() {
        var stubs: [VerbTypeGroup: any VerbTypeConjugator] = [:]
        for group in VerbTypeGroup.allCases { stubs[group] = StubConjugator(group.rawValue) }
        #expect(throws: ConjugationError.backingMismatch(group: .lafif, declared: .unbuilt, registered: true)) {
            try ConjugationService(conjugators: stubs)
        }
    }
}

/// The service's checks against the exported corpus, for every root and form in
/// it: a chart has words exactly when the service says it can exist.
///
/// The one exception is a word an engine refuses for its own reasons, listed in
/// `engineRefusals`. That is the engine's nil, not the service's.
@Suite("Checks match the corpus")
struct CorpusChecksTests {
    /// اِتَّخَذَ: the fāʾ hamza turns into a taa that merges with Form VIII's, and
    /// the mahmūz engine doesn't write that yet.
    static let engineRefusals: [String: Set<VerbForm>] = ["ءخذ": [.viii]]

    let corpusRoots: [String: [String: Any]]
    let lexicon: LexiconService
    let service: ConjugationService

    init() throws {
        let corpus = try #require(try JSONSerialization.jsonObject(with: resource("golden-corpus")) as? [String: Any])
        corpusRoots = try #require(corpus["roots"] as? [String: [String: Any]])
        lexicon = try LexiconService.load()
        service = try Rig().service
    }

    @Test func chartExistsMatchesWhetherTheCorpusHasWords() throws {
        var checked = 0
        for (key, forms) in corpusRoots {
            let root = try #require(lexicon.root(forKey: key), "\(key)")
            for (formName, block) in forms {
                let form = try #require(VerbForm(rawValue: formName))
                let charts = try #require((block as? [String: Any])?["charts"] as? [[String: Any]])
                #expect(charts.count == ChartShape.all.count, "\(key) \(formName)")
                for chart in charts {
                    let shape = try #require(ChartShape(
                        tense: Tense(rawValue: chart["tense"] as! String)!,
                        voice: Voice(rawValue: chart["voice"] as! String)!,
                        mood: (chart["mood"] as? String).flatMap(Mood.init(rawValue:))))
                    let hasWords = !(chart["words"] is NSNull)
                    let refused = Self.engineRefusals[key]?.contains(form) == true
                    #expect((service.chartExists(spec(root, form, shape)) && !refused) == hasWords,
                            "\(key) \(formName) \(shape.tense) \(shape.voice) \(String(describing: shape.mood))")
                    checked += 1
                }
            }
        }
        #expect(checked > 0)
    }

    /// The corpus has a root exactly when its type has an engine.
    @Test func hasEngineMatchesWhichRootsTheCorpusHolds() {
        for root in lexicon.roots {
            #expect(service.hasEngine(root.verbType) == (corpusRoots[root.key] != nil), "\(root.key)")
        }
    }

    /// Every citation in the corpus has both words or is null: no half citations.
    @Test func citationsAreWholeOrAbsent() throws {
        for (key, forms) in corpusRoots {
            for (formName, block) in forms {
                let citation = try #require((block as? [String: Any])?["citation"], "\(key) \(formName)")
                if citation is NSNull { continue }
                let words = try #require(citation as? String).split(separator: " ").count
                #expect(words == 2, "\(key) \(formName)")
            }
        }
    }
}
