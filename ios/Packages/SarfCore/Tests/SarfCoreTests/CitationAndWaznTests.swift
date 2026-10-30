// Tests for citations and the reference-root patterns. Conjugators are stand-ins,
// so the marker words show which chart and root each call reached.

import Foundation
import Testing
@testable import SarfCore

private let katab = testRoot("كتب", .salim, forms: [.i: true, .ii: true, .viii: true, .ix: true])
private let daa = testRoot("دعو", .naqisWaw, forms: [.i: true, .viii: true])
private let kharaj = testRoot("خرج", .salim, forms: [.i: false])

@Suite("citation")
struct CitationTests {
    @Test func isThePastThenThePresent() throws {
        let rig = try Rig()
        #expect(rig.service.citation(katab, form: .ii) == "salim:II:madi:malum:3ms salim:II:mudari:malum:3ms")
    }

    @Test func aFormTheRootDoesNotUseHasNone() throws {
        let rig = try Rig()
        #expect(rig.service.citation(kharaj, form: .iii) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    /// Form IX has no chart, so its name comes from the conjugator's stems.
    @Test func formIXAsksTheConjugatorForItsName() throws {
        let rig = try Rig(recognition: [.salim: "اِحْمَرَّ يَحْمَرُّ"])
        #expect(rig.service.citation(katab, form: .ix) == "اِحْمَرَّ يَحْمَرُّ")
        #expect(rig.stub(.salim).calls == ["recognition"])
    }

    /// Only the sālim conjugator has Form IX stems.
    @Test func formIXIsNilWhereTheConjugatorHasNoStems() throws {
        let rig = try Rig()
        let root = testRoot("مدد", .mudaaf, forms: [.i: true, .ix: true])
        #expect(rig.service.citation(root, form: .ix) == nil)
    }

    @Test func aConjugableFormNeverAsksForStems() throws {
        let rig = try Rig(recognition: [.salim: "unused"])
        _ = rig.service.citation(katab, form: .i)
        #expect(!rig.stub(.salim).calls.contains("recognition"))
    }

    /// دعو in Form VIII has no chart yet, and Form VIII is not a recognition form.
    @Test func formVIIIWithATaaSwallowingFirstLetterIsNil() throws {
        let rig = try Rig(recognition: [.naqis: "unused"])
        #expect(rig.service.citation(daa, form: .viii) == nil)
        #expect(!rig.stub(.naqis).calls.contains("recognition"))
    }

    @Test func aTypeWithNoEngineHasNone() throws {
        let rig = try Rig()
        #expect(rig.service.citation(testRoot("وقي", .lafifMafruq, forms: [.i: true]), form: .i) == nil)
    }
}

@Suite("Citation charts")
struct CitationChartsTests {
    @Test func areTwoOfTheNine() {
        #expect(ChartShape.all.contains(.madiMalum))
        #expect(ChartShape.all.contains(.mudariMalumRaf))
        #expect(ChartShape.madiMalum == ChartShape(tense: .madi, voice: .malum, mood: nil))
        #expect(ChartShape.mudariMalumRaf == ChartShape(tense: .mudari, voice: .malum, mood: .raf))
    }
}

@Suite("Reference root")
struct WaznRootTests {
    @Test func isFaAinLamAndSalim() {
        let root = ConjugationService.waznRoot(form: .ii, bab: nil)
        #expect(root.key == "فعل")
        #expect(root.verbType == .salim)
    }

    /// The stand-in for any verb: it takes an object, so the passive exists.
    @Test func isUsedInOnlyTheFormAskedFor() throws {
        let root = ConjugationService.waznRoot(form: .x, bab: nil)
        #expect(root.recordedForms == [.x])
        #expect(try #require(root.forms[.x]).isTransitive)
    }

    @Test func formICarriesTheBab() {
        for bab in Bab.allCases {
            #expect(ConjugationService.waznRoot(form: .i, bab: bab).bab(for: .i) == bab)
        }
        #expect(ConjugationService.waznRoot(form: .i, bab: nil).bab(for: .i) == nil)
    }
}

@Suite("Patterns")
struct WaznTests {
    let rig: Rig

    init() throws { rig = try Rig() }

    /// A pattern is always a sālim word, whatever the caller's verb.
    @Test func goToTheSalimConjugatorOnTheReferenceRoot() throws {
        let word = rig.service.waznOf(form: .x, shape: Shapes.mudariActiveRaf, slot: .p3ms, bab: nil)
        #expect(word == "salim:X:mudari:malum:3ms")
        let used = try #require(rig.stub(.salim).lastSpec)
        #expect(used.root.key == "فعل")
        #expect(used.form == .x)
    }

    @Test func formIPassesTheBabOn() throws {
        _ = rig.service.waznOf(form: .i, shape: Shapes.madiActive, slot: .p3ms, bab: .ai)
        #expect(try #require(rig.stub(.salim).lastSpec).root.bab(for: .i) == .ai)
    }

    /// The same checks apply: Form VII has no passive.
    @Test func aPatternThatCannotExistIsNil() {
        #expect(rig.service.waznOf(form: .vii, shape: Shapes.madiPassive, slot: .p3ms, bab: nil) == nil)
        #expect(rig.service.waznOf(form: .ix, shape: Shapes.madiActive, slot: .p3ms, bab: nil) == nil)
        #expect(rig.allCalls.isEmpty)
    }

    @Test func derivedNounComesFromTheSalimConjugator() {
        #expect(rig.service.waznOfDerived(form: .x, type: .ismFail, bab: nil) == "salim:X:ismFail")
    }

    @Test func citationIsBuiltOnTheReferenceRoot() {
        #expect(rig.service.waznCitation(form: .ii, bab: nil) == "salim:II:madi:malum:3ms salim:II:mudari:malum:3ms")
    }

    @Test func formIXCitationAsksForStems() throws {
        let rig = try Rig(recognition: [.salim: "فَعَلَّ يَفْعَلُّ"])
        #expect(rig.service.waznCitation(form: .ix, bab: nil) == "فَعَلَّ يَفْعَلُّ")
    }
}
