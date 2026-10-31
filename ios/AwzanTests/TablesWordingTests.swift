// The words and options the Tables sections write: the line over the button, a
// row's subtitle, the reason under the voice row, the three pickers' segments.

import SarfCore
import Testing
@testable import Awzan

@MainActor
struct TablesWordingTests {
    let rig: TablesRig
    var model: TablesModel { rig.model }

    init() throws {
        rig = try TablesRig()
    }

    private func chartLine() throws -> TablesModel.ChartLine {
        switch try #require(model.chart) {
        case .waiting(let line), .open(let line, _): return line
        case .missing: throw Failure.noChart
        }
    }

    private enum Failure: Error { case noChart }

    // MARK: The line

    @Test func theLineNamesFormTenseAndVoice() throws {
        try rig.show("نصر")
        let line = try chartLine()
        #expect(line.title == "Form I · māḍī · maʿrūf")
        #expect(line.countText == "14 ṣiyagh")
    }

    @Test func thePresentAddsItsMood() throws {
        try rig.show("نصر")
        model.select(tense: .mudari)
        model.select(voice: .majhul)
        model.select(mood: .nasb)
        #expect(try chartLine().title == "Form I · muḍāriʿ · majhūl · manṣūb")
    }

    @Test func theCommandHasNeitherAndSixWords() throws {
        try rig.show("نصر", form: .viii)
        model.select(tense: .amr)
        let line = try chartLine()
        #expect(line.title == "Form VIII · amr")
        #expect(line.countText == "6 ṣiyagh")
    }

    // MARK: Rows

    @Test func aRowSaysMeaningFormsAndType() throws {
        model.search("نصر")
        let row = try #require(model.results.first)
        #expect(row.title == "نَصَرَ يَنْصُرُ")
        #expect(row.subtitle == "“to help” · 5 forms · Sound")
    }

    @Test func aVerbWithOneFormSaysForm() throws {
        let row = try #require(model.results.first { $0.formCount == 1 })
        #expect(row.subtitle.contains(" · 1 form · "))
    }

    /// قول is the spec's own example of a row.
    @Test func hollowRow() throws {
        model.search("قول")
        let row = try #require(model.results.first)
        #expect(row.subtitle == "“to say” · 7 forms · Hollow")
    }

    /// The engine has no citation for Form VIII of ضرب, so the letters stand in. The
    /// search never opens a row there (it opens in Form I), so it is built by hand.
    @Test func aRowWithNoCitationShowsItsLetters() throws {
        let root = try rig.root("ضرب")
        let row = TablesModel.SearchResult(
            root: root, form: .viii, citation: nil, gloss: "to be agitated",
            formCount: 5, group: .salim)
        #expect(row.title == "ض ر ب")
    }

    @Test func rootLettersAreSpacedApart() throws {
        let root = try rig.root("نصر")
        #expect(root.spacedLetters == "ن ص ر")
    }

    @Test func aMeaningIsQuoted() {
        #expect("to help".quotedAsMeaning == "“to help”")
    }

    // MARK: The sentences

    @Test func theReasonNamesTheVerb() {
        #expect(TablesModel.MajhulGap.intransitive(pastWord: "خَرَجَ").sentence == "خَرَجَ is intransitive — it has no majhūl.")
    }

    @Test func theReasonStillReadsWithNoVerbToName() {
        #expect(TablesModel.MajhulGap.intransitive(pastWord: nil).sentence == "This verb is intransitive — it has no majhūl.")
    }

    @Test func theFixedSentences() {
        #expect(TablesCopy.commandHasNoVoiceOrMood == "The amr has neither voice nor iʿrāb.")
        #expect(TablesCopy.noChart == "This verb has no chart for that selection.")
        #expect(TablesCopy.nothingMatches("zzzz") == "Nothing matches “zzzz”.")
    }

    // MARK: The pickers' options

    @Test func theTenseRowShowsTheArabicToo() {
        #expect(TablesSegments.tense.map(\.value) == [.madi, .mudari, .amr])
        #expect(TablesSegments.tense.map(\.english) == ["māḍī", "muḍāriʿ", "amr"])
        #expect(TablesSegments.tense.map(\.arabic) == ["مَاضٍ", "مُضَارِع", "أَمْر"])
        #expect(TablesSegments.tense.allSatisfy { $0.isEnabled })
    }

    @Test func theVoiceAndMoodRowsShowOnlyTheLatin() {
        #expect(TablesSegments.voice(gap: nil).map(\.english) == ["maʿrūf", "majhūl"])
        #expect(TablesSegments.mood.map(\.english) == ["marfūʿ", "manṣūb", "majzūm"])
        #expect(TablesSegments.voice(gap: nil).allSatisfy { $0.arabic == nil })
        #expect(TablesSegments.mood.allSatisfy { $0.arabic == nil })
    }

    @Test func majhulIsSwitchedOffWithTheReasonAndMaarufNever() {
        let gap = TablesModel.MajhulGap.intransitive(pastWord: "خَرَجَ")
        let voices = TablesSegments.voice(gap: gap)
        #expect(voices[0].isEnabled)
        #expect(!voices[1].isEnabled)
        #expect(voices[1].disabledReason == gap.sentence)
        #expect(TablesSegments.voice(gap: nil).allSatisfy { $0.isEnabled })
    }

    /// What the voice row gets for a real verb, end to end.
    @Test func anIntransitiveVerbSwitchesMajhulOff() throws {
        try rig.show("خرج")
        let voices = TablesSegments.voice(gap: model.majhulGap)
        #expect(voices[1].disabledReason == "خَرَجَ is intransitive — it has no majhūl.")
    }
}

/// What the word bar shows and what its taps do.
@MainActor
struct TablesWordBarTests {
    let rig: TablesRig
    var model: TablesModel { rig.model }

    init() throws {
        rig = try TablesRig()
    }

    @Test func theFirstOpenIsAnEmptySearchWithNowhereToGoBack() {
        #expect(WordBarSection.state(of: model) == .searching(query: ""))
        #expect(!WordBarSection.canGoBack(model))
    }

    @Test func aChosenVerbShowsItsCitationAndQuotedMeaning() throws {
        try rig.show("نصر")
        #expect(WordBarSection.state(of: model) == .chosen(citation: "نَصَرَ يَنْصُرُ", gloss: "“to help”"))
    }

    @Test func aVerbWithNoCitationShowsItsLetters() throws {
        try rig.show("ضرب", form: .viii)
        guard case .chosen(let citation, _) = WordBarSection.state(of: model) else { Issue.record("not chosen"); return }
        #expect(citation == "ض ر ب")
    }

    @Test func tappingTheVerbOpensTheSearchAndTheCrossGoesBack() throws {
        try rig.show("نصر")
        WordBarSection.apply(.searching(query: ""), to: model)
        #expect(WordBarSection.state(of: model) == .searching(query: ""))
        #expect(WordBarSection.canGoBack(model))
        model.cancelSearch()
        #expect(model.chosen != nil)
    }

    @Test func typingChangesTheQuery() {
        WordBarSection.apply(.searching(query: "نص"), to: model)
        #expect(WordBarSection.state(of: model) == .searching(query: "نص"))
    }

    @Test func theBarNeverChoosesAVerbItself() throws {
        try rig.show("نصر")
        let before = model.stage
        WordBarSection.apply(.chosen(citation: "x", gloss: "y"), to: model)
        #expect(model.stage == before)
    }
}
