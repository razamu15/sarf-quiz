// The service built by `load()`, checked against the bundled corpus: every cell
// the JS service answered is answered the same way here.
//
// The corpus is read again here with JSONSerialization and not through the
// loader, so a mistake in the loader can't hide itself.

import Foundation
import Testing
@testable import SarfCore

private let nounTypes = DerivedNounType.allCases

@Suite("Stand-in answers every cell")
struct StandInCellsTests {
    let service: ConjugationService
    let lexicon: LexiconService
    let roots: [String: [String: [String: Any]]]
    let wazn: [[String: Any]]

    init() throws {
        service = try ConjugationService.load()
        lexicon = try LexiconService.load()
        let corpus = try #require(try JSONSerialization.jsonObject(with: resource("golden-corpus")) as? [String: Any])
        roots = try #require(corpus["roots"] as? [String: [String: [String: Any]]])
        wazn = try #require(corpus["wazn"] as? [[String: Any]])
    }

    /// What one block says, and what the service says, side by side.
    private struct Asked {
        let word: (ChartShape, PronounSlot) -> String?
        let table: (ChartShape) -> [PronounSlot: String]?
        let noun: (DerivedNounType) -> String?
        let citation: () -> String?
    }

    /// Compares every cell of `block` with the service's answer. Returns how many
    /// cells it compared, and adds a line to `problems` for each that differs.
    private func compare(_ block: [String: Any], _ label: String, _ asked: Asked, _ problems: inout [String]) throws -> Int {
        var cells = 0
        for chart in try #require(block["charts"] as? [[String: Any]]) {
            let shape = try #require(ChartShape(
                tense: Tense(rawValue: chart["tense"] as! String)!,
                voice: Voice(rawValue: chart["voice"] as! String)!,
                mood: (chart["mood"] as? String).flatMap(Mood.init(rawValue:))))
            let written = chart["words"] as? [String: Any]
            var expectedTable: [PronounSlot: String] = [:]
            for slot in shape.tense.slots {
                let expected = written?[slot.rawValue] as? String
                if let expected { expectedTable[slot] = expected }
                let got = asked.word(shape, slot)
                if got != expected { problems.append("\(label) \(shape.tense) \(shape.voice) \(String(describing: shape.mood)) \(slot): \(String(describing: got)) ≠ \(String(describing: expected))") }
                cells += 1
            }
            let table = asked.table(shape)
            if table != (expectedTable.isEmpty ? nil : expectedTable) { problems.append("\(label) \(shape.tense) \(shape.voice) \(String(describing: shape.mood)): table") }
        }
        let nouns = try #require(block["derived"] as? [String: Any])
        for type in nounTypes where asked.noun(type) != nouns[type.rawValue] as? String {
            problems.append("\(label) \(type)")
        }
        if asked.citation() != block["citation"] as? String { problems.append("\(label) citation") }
        return cells
    }

    /// 578 root-forms and 15 patterns, 118 cells each: 69,974.
    @Test func everyCellMatchesTheCorpus() throws {
        var problems: [String] = []
        var cells = 0
        var blocks = 0
        for (key, forms) in roots {
            let root = try #require(lexicon.root(forKey: key), "\(key)")
            for (name, block) in forms {
                let form = try #require(VerbForm(rawValue: name))
                cells += try compare(block, "\(key) \(name)", Asked(
                    word: { service.conjugate(ConjugationSpec(root: root, form: form, shape: $0), slot: $1) },
                    table: { service.fullTable(ConjugationSpec(root: root, form: form, shape: $0)) },
                    noun: { service.derivedNoun(root, form: form, type: $0) },
                    citation: { service.citation(root, form: form) }), &problems)
                blocks += 1
            }
        }
        #expect(blocks == 578)

        for entry in wazn {
            let form = try #require(VerbForm(rawValue: entry["form"] as! String))
            let bab = (entry["bab"] as? String).flatMap(Bab.init(rawValue:))
            cells += try compare(try #require(entry["block"] as? [String: Any]), "wazn \(form) \(String(describing: bab))", Asked(
                word: { service.waznOf(form: form, shape: $0, slot: $1, bab: bab) },
                table: { service.fullTable(ConjugationSpec(root: ConjugationService.waznRoot(form: form, bab: bab), form: form, shape: $0)) },
                noun: { service.waznOfDerived(form: form, type: $0, bab: bab) },
                citation: { service.waznCitation(form: form, bab: bab) }), &problems)
            blocks += 1
        }
        #expect(blocks == 593)
        #expect(cells == 69_974)
        #expect(problems.isEmpty, "\(problems.count) differ, for example \(problems.prefix(5))")
    }

    /// The corpus has no lafīf, so every lafīf word is nil. Not "no such word":
    /// there is no engine.
    @Test func aTypeWithNoEngineAnswersNothing() {
        let lafif = lexicon.roots.filter { $0.verbType.group == .lafif }
        #expect(!lafif.isEmpty)
        for root in lafif {
            #expect(!service.hasEngine(root.verbType))
            for form in root.recordedForms {
                #expect(service.citation(root, form: form) == nil, "\(root.key)")
                for type in nounTypes { #expect(service.derivedNoun(root, form: form, type: type) == nil, "\(root.key)") }
                for shape in ChartShape.all {
                    #expect(service.fullTable(ConjugationSpec(root: root, form: form, shape: shape)) == nil, "\(root.key)")
                }
            }
        }
    }

    @Test func everyOtherTypeHasWords() {
        for root in lexicon.roots where root.verbType.group != .lafif {
            #expect(service.hasEngine(root.verbType), "\(root.key)")
        }
    }

    /// The reference root is found by its letters, so the lexicon can't have a root with them.
    @Test func noLexiconRootHasTheReferenceLetters() {
        #expect(!lexicon.roots.contains { $0.radicals == ConjugationService.waznRadicals })
    }

    @Test func availableTypesLeaveOutTheTypeWithNoEngine() {
        let everything = lexicon.availableTypes(gate: ContentGate(mahmuz: true, lafif: true), conjugation: service)
        #expect(Set(everything) == Set(lexicon.stockedTypes.filter { $0.group != .lafif }))
    }
}
