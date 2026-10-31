// The Tables search: which verbs it lists, in what order, and what a row says.

import SarfCore
import Testing
@testable import Awzan

@MainActor
struct TablesSearchTests {
    let rig: TablesRig

    init() throws {
        rig = try TablesRig()
    }

    private func keys(_ query: String) -> [String] {
        rig.model.search(query)
        return rig.model.results.map(\.root.key)
    }

    // MARK: Which verbs

    @Test func anEmptySearchListsEveryPlayableVerbOnce() {
        let keys = rig.model.results.map(\.root.key)
        #expect(keys.count == 136)
        #expect(Set(keys).count == 136)
    }

    @Test func theListIsEveryRootNotHeldBack() {
        let held: Set<VerbTypeGroup> = [.mahmuz, .lafif]
        let expected = Set(rig.lexicon.roots.filter { !held.contains($0.verbType.group) }.map(\.key))
        #expect(Set(rig.model.results.map(\.root.key)) == expected)
    }

    @Test func releasingMahmuzAddsItsVerbsAndNoOthers() throws {
        let released = try TablesRig(gate: ContentGate(mahmuz: true, lafif: false))
        let added = Set(released.model.results.map(\.root.key)).subtracting(rig.model.results.map(\.root.key))
        #expect(added.count == 15)
        #expect(try added.allSatisfy { try released.root($0).verbType.group == .mahmuz })
    }

    /// Lafīf has no engine yet, so releasing it lists nothing more.
    @Test func releasingLafifListsNothingMore() throws {
        let released = try TablesRig(gate: ContentGate(mahmuz: false, lafif: true))
        #expect(released.model.results.count == 136)
    }

    @Test func aVerbThatIsShownHasNoSearchList() throws {
        try rig.show("نصر")
        #expect(rig.model.results.isEmpty)
    }

    // MARK: Order

    /// The list sorts by Unicode order. This checks it against the alphabet
    /// written out by hand, so a letter that sat elsewhere would show.
    @Test func rootsAreInArabicAlphabetOrder() {
        let alphabet = Array("ءأبتثجحخدذرزسشصضطظعغفقكلمنهوي")
        func rank(_ key: String) -> [Int] { key.compactMap { alphabet.firstIndex(of: $0) } }
        let keys = rig.model.results.map(\.root.key)
        #expect(keys == keys.sorted { rank($0).lexicographicallyPrecedes(rank($1)) })
    }

    @Test func everyLetterOfTheLexiconIsInTheAlphabetAbove() {
        let alphabet = Set("ءأبتثجحخدذرزسشصضطظعغفقكلمنهوي")
        #expect(rig.lexicon.roots.allSatisfy { Set($0.key).isSubset(of: alphabet) })
    }

    // MARK: What matches

    @Test func rootLettersMatchWithOrWithoutSpaces() {
        #expect(keys("نصر").contains("نصر"))
        #expect(keys("ن ص ر").contains("نصر"))
        #expect(keys("  نصر ").contains("نصر"))
        #expect(keys("نص").contains("نصر"))
    }

    /// Form VIII of نصر means "to triumph"; Form I means "to help".
    @Test func anyFormsMeaningMatchesAndCaseDoesNotMatter() {
        #expect(keys("triumph").contains("نصر"))
        #expect(keys("TRIUMPH").contains("نصر"))
    }

    @Test func conjugatedWordsAreNotSearched() {
        #expect(keys("يَنْصُرُونَ").isEmpty)
        #expect(keys("نَصَرَ").isEmpty)
    }

    @Test func textThatMatchesNothingListsNothing() {
        #expect(keys("zzzz").isEmpty)
    }

    @Test func theTextTypedIsKept() {
        rig.model.search("نص")
        #expect(rig.model.stage == .searching(query: "نص", returningTo: nil))
    }

    // MARK: What a row says

    @Test func aRowReadsAsAVerb() throws {
        rig.model.search("قول")
        let row = try #require(rig.model.results.first)
        #expect(row.citation == "قَالَ يَقُولُ")
        #expect(row.gloss == "to say")
        #expect(row.formCount == 7)
        #expect(row.group == .ajwaf)
        #expect(row.form == .i)
    }

    /// A verb found through a later form still opens in Form I, and says Form I's
    /// meaning.
    @Test func aRowFoundByAnotherFormsMeaningStillOpensInFormI() throws {
        rig.model.search("triumph")
        let row = try #require(rig.model.results.first { $0.root.key == "نصر" })
        #expect(row.form == .i)
        #expect(row.gloss == "to help")
    }

    @Test func fiveVerbsWithNoFormIOpenInTheirFirstForm() throws {
        let expected: [String: VerbForm] = ["شرك": .iii, "حمر": .ii, "صلو": .ii, "لبي": .ii, "أدي": .ii]
        for (key, form) in expected {
            rig.model.search(key)
            let row = try #require(rig.model.results.first { $0.root.key == key }, "\(key)")
            #expect(row.form == form, "\(key)")
            #expect(row.citation == rig.conjugation.citation(try rig.root(key), form: form), "\(key)")
        }
        #expect(try expected.keys.allSatisfy { try rig.root($0).forms[.i] == nil })
    }

    /// The lexicon has exactly these five. If it grows another, the spec's list is
    /// out of date.
    @Test func noOtherPlayableVerbLacksFormI() {
        let without = rig.model.results.filter { $0.root.forms[.i] == nil }.map(\.root.key)
        #expect(Set(without) == ["شرك", "حمر", "صلو", "لبي", "أدي"])
    }

    @Test func everyPlayableVerbHasAFormAndACitationInItsFirstForm() {
        #expect(rig.model.results.allSatisfy { $0.formCount > 0 && $0.citation != nil })
    }
}
