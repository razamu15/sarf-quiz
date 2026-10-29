// S0.2 — the vocabulary against the files S0.1 exported. This is what "the JSON's
// keys are these values" means in practice: every type, form, bāb, chart shape,
// slot and derived-noun key in roots.json and golden-corpus.json must decode into
// the enums, and the enums must not hold a case the data never uses.
//
// The decoders here are test-local and deliberately thin — they exist to push the
// files through the vocabulary types. The real loaders are S0.3 (the lexicon) and
// S0.6 (the corpus).

import Foundation
import Testing
@testable import SarfCore

private struct MissingResource: Error { let name: String }

/// SwiftPM's `.copy("Resources/x.json")` lands the file at the bundle's top level,
/// not under a Resources/ folder — so there is no `subdirectory:`.
private func resource(_ name: String) throws -> Data {
    guard let url = Bundle.module.url(forResource: name, withExtension: "json") else {
        throw MissingResource(name: name)
    }
    return try Data(contentsOf: url)
}

// MARK: roots.json

private struct RootsFile: Decodable {
    struct Root: Decodable {
        let type: String
        let forms: [String: FormUsage]
    }
    struct FormUsage: Decodable { let bab: String? }
    let roots: [Root]
}

@Suite("Vocabulary ↔ roots.json")
struct RootsVocabularyTests {
    private let roots: [RootsFile.Root]

    init() throws {
        roots = try JSONDecoder().decode(RootsFile.self, from: resource("roots")).roots
    }

    @Test func everyTypeIsAVerbTypeAndEveryVerbTypeIsStocked() throws {
        let types = try roots.map { try #require(VerbType(rawValue: $0.type), "unknown type \($0.type)") }
        #expect(Set(types) == Set(VerbType.allCases))
    }

    @Test func everyFormKeyIsAVerbForm() throws {
        for root in roots {
            for key in root.forms.keys { #expect(VerbForm(rawValue: key) != nil, "unknown form \(key)") }
        }
    }

    /// `bab` is Form I's alone; and every Form I the lexicon records has a valid one.
    @Test func babIsFormIOnlyAndAlwaysValid() throws {
        var sawEachBab = Set<Bab>()
        for root in roots {
            for (form, usage) in root.forms {
                if form == VerbForm.i.rawValue {
                    let raw = try #require(usage.bab, "Form I without a bāb")
                    sawEachBab.insert(try #require(Bab(rawValue: raw), "unknown bāb \(raw)"))
                } else {
                    #expect(usage.bab == nil, "mazīd form \(form) carries a bāb")
                }
            }
        }
        #expect(sawEachBab == Set(Bab.allCases))
    }
}

// MARK: golden-corpus.json

private struct Corpus: Decodable {
    struct Chart: Decodable {
        let shape: ChartShape
        let words: [String: String?]?

        private enum Keys: String, CodingKey { case words }
        init(from decoder: Decoder) throws {
            shape = try ChartShape(from: decoder)
            // `[…]?.self`, not decodeIfPresent: a missing `words` key is a stale corpus.
            words = try decoder.container(keyedBy: Keys.self).decode([String: String?]?.self, forKey: .words)
        }
    }
    struct Block: Decodable {
        let citation: String
        let derived: [String: String?]
        let charts: [Chart]
    }
    struct WaznEntry: Decodable {
        let form: String
        let bab: String?
        let block: Block
    }
    let roots: [String: [String: Block]]
    let wazn: [WaznEntry]
}

@Suite("Vocabulary ↔ golden-corpus.json")
struct CorpusVocabularyTests {
    private let corpus: Corpus

    init() throws {
        corpus = try JSONDecoder().decode(Corpus.self, from: resource("golden-corpus"))
    }

    private var allBlocks: [Corpus.Block] {
        corpus.roots.values.flatMap { $0.values } + corpus.wazn.map(\.block)
    }

    @Test func everyFormKeyIsAVerbForm() {
        for (radicals, forms) in corpus.roots {
            for key in forms.keys { #expect(VerbForm(rawValue: key) != nil, "\(radicals): unknown form \(key)") }
        }
        for entry in corpus.wazn { #expect(VerbForm(rawValue: entry.form) != nil) }
    }

    /// Every form block lists the nine shapes, each valid, in `ChartShape.all` order.
    @Test func everyBlockHasTheNineShapesInOrder() {
        for block in allBlocks { #expect(block.charts.map(\.shape) == ChartShape.all) }
    }

    /// A chart that exists has exactly the slots its tense says — 14, or the amr's
    /// six — each a word or an explicit null. A chart that does not exist is `null`.
    @Test func everyChartHasExactlyItsTensesSlots() {
        for block in allBlocks {
            for chart in block.charts {
                guard let words = chart.words else { continue }
                #expect(Set(words.keys) == Set(chart.shape.tense.slots.map(\.rawValue)))
                #expect(words.count == chart.shape.tense.slots.count)
            }
        }
    }

    @Test func everyBlockHasTheThreeDerivedNouns() {
        for block in allBlocks {
            #expect(Set(block.derived.keys) == Set(DerivedNounType.allCases.map(\.rawValue)))
        }
    }

    /// The wazn root: Form I once per bāb, each mazīd form once with no bāb.
    @Test func waznEntriesCarryABabOnFormIOnly() throws {
        let formI = corpus.wazn.filter { $0.form == VerbForm.i.rawValue }
        let babs = try formI.map { entry in
            try #require(entry.bab.flatMap(Bab.init(rawValue:)), "Form I wazn without a valid bāb")
        }
        #expect(babs == Bab.allCases)
        for entry in corpus.wazn where entry.form != VerbForm.i.rawValue {
            #expect(entry.bab == nil)
        }
    }
}
