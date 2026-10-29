// Checks the vocabulary enums against the two JSON files: every type, form, bab,
// chart shape, slot and derived-noun key in the files must decode into an enum,
// and no enum case may go unused by the data.
//
// The decoding structs here are only for these tests.

import Foundation
import Testing
@testable import SarfCore

private struct MissingResource: Error { let name: String }

/// Reads one of the bundled JSON files. SwiftPM puts them at the top of the
/// bundle, so there is no subdirectory.
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

    /// Only Form I has a bab, and every Form I has a valid one.
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
            // `words` must be present, even when it is null.
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

    /// Every form lists the nine charts, in `ChartShape.all` order.
    @Test func everyBlockHasTheNineShapesInOrder() {
        for block in allBlocks { #expect(block.charts.map(\.shape) == ChartShape.all) }
    }

    /// A chart has exactly its tense's slots (14, or 6 for the command), each a
    /// word or null. A chart that doesn't exist is null.
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

    /// The wazn root has Form I once per bab, and each other form once with no bab.
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
