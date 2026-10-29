// Tests for the lexicon: classify, the real roots.json, and the loader's refusals.
//
// No test pins a count ("166 roots"), because the lexicon grows often. They check
// properties that stay true as roots are added.

import Foundation
import Testing
@testable import SarfCore

private func radicals(_ word: String) -> Radicals {
    let letters = Array(word.unicodeScalars)
    return Radicals(fa: letters[0], ayn: letters[1], lam: letters[2])
}

@Suite("classify")
struct ClassifyTests {
    @Test(arguments: [
        ("كتب", VerbType.salim),
        ("قول", .ajwafWaw), ("بيع", .ajwafYa),
        ("رمي", .naqisYa), ("دعو", .naqisWaw),
        ("مدد", .mudaaf), ("أخذ", .mahmuz),
        ("وعد", .mithalWaw), ("يقن", .mithalYa),
        ("وقي", .lafifMafruq), ("طوي", .lafifMaqrun),
    ])
    func classifies(word: String, expected: VerbType) {
        #expect(LexiconService.classify(radicals(word)) == expected)
    }

    /// يئس has a weak first letter and a hamza; the weak letter decides.
    @Test func weaknessOutranksAHamza() {
        #expect(LexiconService.classify(radicals("يئس")) == .mithalYa)
    }

    /// أمم has a hamza and a doubled last letter; the doubled letter decides.
    @Test func muḍāʿafOutranksAHamza() {
        #expect(LexiconService.classify(radicals("أمم")) == .mudaaf)
    }
}

@Suite("The bundled lexicon")
struct BundledLexiconTests {
    let lexicon: LexiconService

    init() throws {
        lexicon = try LexiconService.load()
    }

    /// A content mistake in roots.json fails here.
    @Test func loads() {
        #expect(!lexicon.roots.isEmpty)
    }

    @Test func everyDeclaredTypeIsWhatTheRadicalsImply() {
        for root in lexicon.roots {
            #expect(LexiconService.classify(root.radicals) == root.verbType, "\(root.key)")
        }
    }

    @Test func everyKeyIsUniqueAndLooksUpToItsRoot() {
        for root in lexicon.roots { #expect(lexicon.root(forKey: root.key) == root) }
        #expect(Set(lexicon.roots.map(\.key)).count == lexicon.roots.count)
    }

    @Test func everyVerbTypeIsStocked() {
        #expect(Set(lexicon.stockedTypes) == Set(VerbType.allCases))
        #expect(lexicon.stockedTypes.count == VerbType.allCases.count)
    }

    @Test func everyRootHasAForm() {
        for root in lexicon.roots { #expect(!root.forms.isEmpty, "\(root.key)") }
    }

    @Test func recordedFormsRunFormIToX() {
        for root in lexicon.roots {
            let forms = root.recordedForms
            #expect(forms == forms.sorted { VerbForm.allCases.firstIndex(of: $0)! < VerbForm.allCases.firstIndex(of: $1)! })
            #expect(Set(forms) == Set(root.forms.keys))
        }
    }

    /// The loader allows a Form I with no bab, but today none is missing.
    @Test func everyFormIHasABab() {
        for root in lexicon.roots where root.forms[.i] != nil {
            #expect(root.bab(for: .i) != nil, "\(root.key) Form I has no bāb")
        }
    }

    @Test func aMazeedFormHasNoBab() {
        for root in lexicon.roots {
            for form in root.recordedForms where form != .i { #expect(root.bab(for: form) == nil) }
        }
    }

    /// `english` may only be missing for a "to be ..." gloss, and only a
    /// transitive form has a pastParticiple.
    @Test func englishIsAbsentOnlyForToBeGlosses() {
        for root in lexicon.roots {
            for (form, rootForm) in root.forms {
                let id = "\(root.key) \(form.rawValue)"
                if rootForm.english == nil { #expect(rootForm.gloss.hasPrefix("to be "), "\(id): \(rootForm.gloss)") }
                if !rootForm.isTransitive { #expect(rootForm.english?.pastParticiple == nil, "\(id)") }
            }
        }
    }

    /// Only Form I has faaDrops.
    @Test func faaDropsIsOnFormIOnly() {
        for root in lexicon.roots {
            for form in root.recordedForms where form != .i { #expect(root.forms[form]?.faaDrops == nil) }
        }
    }

    @Test func kataba() throws {
        let kataba = try #require(lexicon.root(forKey: "كتب"))
        #expect(kataba.verbType == .salim)
        #expect(kataba.recordedForms.first == .i)
        #expect(kataba.bab(for: .i) == .au)
        #expect(kataba.forms[.i]?.masdar == "كِتَابَة")
        #expect(kataba.forms[.i]?.gloss == "to write")
        #expect(kataba.forms[.i]?.english?.pastParticiple == "written")
        #expect(kataba.bab(for: .ii) == nil)
        #expect(lexicon.root(forKey: "ZZZ") == nil)
    }

    /// The three roots that state faaDrops today.
    @Test func faaDropsKeepsTheThreeStatedValues() throws {
        #expect(try #require(lexicon.root(forKey: "وجل")).forms[.i]?.faaDrops == false)
        #expect(try #require(lexicon.root(forKey: "وجع")).forms[.i]?.faaDrops == false)
        #expect(try #require(lexicon.root(forKey: "وسع")).forms[.i]?.faaDrops == true)
    }

    @Test func candidatesAreFilteredAndOrdered() {
        let found = lexicon.candidates(types: [.salim], forms: [.ii, .i])
        #expect(!found.isEmpty)
        for pair in found {
            #expect(pair.root.verbType == .salim)
            #expect([.i, .ii].contains(pair.form))
            #expect(pair.root.forms[pair.form] != nil)
        }
        // Roots in file order; within a root, Form I before Form II.
        let keysInOrder = found.map(\.root.key).reduce(into: [String]()) { if $0.last != $1 { $0.append($1) } }
        #expect(keysInOrder == lexicon.roots.filter { $0.verbType == .salim && $0.recordedForms.contains { [.i, .ii].contains($0) } }.map(\.key))
        let kataba = found.filter { $0.root.key == "كتب" }.map(\.form)
        #expect(kataba == [.i, .ii])
    }

    @Test func noTypesOrNoFormsIsEmptyNotEverything() {
        #expect(lexicon.candidates(types: [], forms: Set(VerbForm.allCases)).isEmpty)
        #expect(lexicon.candidates(types: Set(VerbType.allCases), forms: []).isEmpty)
    }
}

@Suite("Loading refuses bad content")
struct LexiconRefusalTests {
    private func lexiconJSON(_ roots: String...) -> Data {
        Data(#"{"roots":[\#(roots.joined(separator: ","))]}"#.utf8)
    }

    private let good = #"{"root":["ك","ت","ب"],"type":"salim","forms":{"I":{"bab":"au","trans":true,"gloss":"to write"}}}"#

    @Test func aGoodFixtureLoads() throws {
        let lexicon = try LexiconService.load(from: lexiconJSON(good))
        #expect(lexicon.roots.map(\.key) == ["كتب"])
    }

    @Test func aMislabelledRootNamesBothTypes() {
        let mislabelled = #"{"root":["ك","ت","ب"],"type":"mudaaf","forms":{"I":{"bab":"au","trans":true,"gloss":"x"}}}"#
        #expect(throws: LexiconError.typeMismatch(root: "كتب", declared: .mudaaf, implied: .salim)) {
            try LexiconService.load(from: lexiconJSON(mislabelled))
        }
    }

    @Test func aDuplicateRootIsRefused() {
        #expect(throws: LexiconError.duplicateRoot("كتب")) {
            try LexiconService.load(from: lexiconJSON(good, good))
        }
    }

    @Test func aBabOnAMazeedFormIsRefused() {
        let bad = #"{"root":["ك","ت","ب"],"type":"salim","forms":{"I":{"bab":"au","trans":true,"gloss":"x"},"II":{"bab":"au","trans":true,"gloss":"y"}}}"#
        #expect(throws: LexiconError.babOnMazeedForm(root: "كتب", form: .ii)) {
            try LexiconService.load(from: lexiconJSON(bad))
        }
    }

    /// Each of these is a DecodingError.
    @Test(arguments: [
        ("two radicals", #"{"root":["ك","ت"],"type":"salim","forms":{"I":{"bab":"au","trans":true,"gloss":"x"}}}"#),
        ("four radicals", #"{"root":["ك","ت","ب","ب"],"type":"salim","forms":{"I":{"bab":"au","trans":true,"gloss":"x"}}}"#),
        ("a radical with a ḥaraka", #"{"root":["كَ","ت","ب"],"type":"salim","forms":{"I":{"bab":"au","trans":true,"gloss":"x"}}}"#),
        ("a radical that is a mark", #"{"root":["ك","ت","َ"],"type":"salim","forms":{"I":{"bab":"au","trans":true,"gloss":"x"}}}"#),
        ("an unknown type", #"{"root":["ك","ت","ب"],"type":"quadriliteral","forms":{"I":{"bab":"au","trans":true,"gloss":"x"}}}"#),
        ("an unknown form", #"{"root":["ك","ت","ب"],"type":"salim","forms":{"XI":{"trans":true,"gloss":"x"}}}"#),
        ("an unknown bāb", #"{"root":["ك","ت","ب"],"type":"salim","forms":{"I":{"bab":"oo","trans":true,"gloss":"x"}}}"#),
        ("a missing trans", #"{"root":["ك","ت","ب"],"type":"salim","forms":{"I":{"bab":"au","gloss":"x"}}}"#),
        ("a missing gloss", #"{"root":["ك","ت","ب"],"type":"salim","forms":{"I":{"bab":"au","trans":true}}}"#),
        ("a missing type", #"{"root":["ك","ت","ب"],"forms":{"I":{"bab":"au","trans":true,"gloss":"x"}}}"#),
    ])
    func badContentIsADecodingError(why: String, root: String) {
        #expect(throws: DecodingError.self, "\(why)") {
            try LexiconService.load(from: lexiconJSON(root))
        }
    }

    @Test func malformedJSONThrows() {
        #expect(throws: (any Error).self) { try LexiconService.load(from: Data("{".utf8)) }
    }

    /// Optional fields stay nil when missing.
    @Test func optionalFieldsStayAbsent() throws {
        let lexicon = try LexiconService.load(from: lexiconJSON(good))
        let rootForm = try #require(lexicon.roots.first?.forms[.i])
        #expect(rootForm.masdar == nil)
        #expect(rootForm.faaDrops == nil)
        #expect(rootForm.english == nil)
    }
}
