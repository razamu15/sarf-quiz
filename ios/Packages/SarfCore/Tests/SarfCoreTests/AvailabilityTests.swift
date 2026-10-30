// Tests for what is playable: where each group's words come from, the content
// gates, and which verb types the app offers.

import Foundation
import Testing
@testable import SarfCore

private let closed = ContentGate(mahmuz: false, lafif: false)
private let open = ContentGate(mahmuz: true, lafif: true)

@Suite("Engine backing")
struct EngineBackingTests {
    /// The declared state. Flipping a group to `.engine` changes a row here.
    @Test func eachGroupsBacking() {
        let expected: [VerbTypeGroup: EngineBacking] = [
            .salim: .corpus, .mahmuz: .corpus, .mudaaf: .corpus,
            .mithal: .corpus, .ajwaf: .corpus, .naqis: .corpus,
            .lafif: .unbuilt,
        ]
        #expect(Set(expected.keys) == Set(VerbTypeGroup.allCases))
        for group in VerbTypeGroup.allCases {
            #expect(engineBacking(for: group) == expected[group], "\(group)")
        }
    }
}

@Suite("ContentGate")
struct ContentGateTests {
    @Test func gatedGroupsFollowTheirGate() {
        #expect(open.isOpen(.mahmuz) && open.isOpen(.lafif))
        #expect(!closed.isOpen(.mahmuz) && !closed.isOpen(.lafif))
        #expect(ContentGate(mahmuz: true, lafif: false).isOpen(.mahmuz))
        #expect(!ContentGate(mahmuz: true, lafif: false).isOpen(.lafif))
    }

    @Test func otherGroupsAreAlwaysOpen() {
        for group in [VerbTypeGroup.salim, .mudaaf, .mithal, .ajwaf, .naqis] {
            #expect(closed.isOpen(group), "\(group)")
        }
    }
}

@Suite("availableTypes")
struct AvailableTypesTests {
    let lexicon: LexiconService
    let service: ConjugationService

    init() throws {
        lexicon = try LexiconService.load()
        service = try Rig().service
    }

    private func available(_ gate: ContentGate) -> [VerbType] {
        lexicon.availableTypes(gate: gate, conjugation: service)
    }

    @Test func aClosedGateHidesItsGroup() {
        let types = available(closed)
        #expect(!types.contains(.mahmuz))
        #expect(types.contains(.salim))
    }

    @Test func anOpenGateShowsItsGroup() {
        #expect(available(ContentGate(mahmuz: true, lafif: false)).contains(.mahmuz))
    }

    /// Lafīf is stocked but has no engine, so an open gate doesn't make it playable.
    @Test func aGroupWithNoEngineStaysOutEvenWithItsGateOpen() {
        #expect(lexicon.stockedTypes.contains(.lafifMafruq))
        #expect(!available(open).contains(.lafifMafruq))
        #expect(!available(open).contains(.lafifMaqrun))
    }

    @Test func isStockedTypesFilteredInTheirOrder() {
        let types = available(open)
        #expect(types == lexicon.stockedTypes.filter { service.hasEngine($0) })
    }

    @Test func aTypeTheLexiconHasNoRootsForIsNotOffered() throws {
        let tiny = try LexiconService.load(from: Data("""
            {"roots": [{"root": ["ك","ت","ب"], "type": "salim",
                        "forms": {"I": {"bab": "au", "trans": true, "gloss": "to write"}}}]}
            """.utf8))
        #expect(tiny.availableTypes(gate: open, conjugation: service) == [.salim])
    }
}
