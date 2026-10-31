// The Tables choices: the verb, its form, the three pickers, the passive, and
// the table that waits for its button.

import Foundation
import SarfCore
import Synchronization
import Testing
@testable import Awzan

@MainActor
struct TablesSelectionTests {
    let rig: TablesRig
    var model: TablesModel { rig.model }

    init() throws {
        rig = try TablesRig()
    }

    // MARK: The verb

    @Test func theFirstOpenIsASearchWithNothingToGoBackTo() {
        #expect(model.stage == .searching(query: "", returningTo: nil))
        #expect(model.chosen == nil)
        #expect(model.chart == nil)
        #expect(model.forms.isEmpty)
        model.cancelSearch()
        #expect(model.stage == .searching(query: "", returningTo: nil))
    }

    @Test func choosingAVerbShowsItInFormIWithTheTableWaiting() throws {
        try rig.show("نصر")
        let verb = try #require(model.chosen)
        #expect(verb.form == .i)
        #expect(model.verbName == .init(citation: "نَصَرَ يَنْصُرُ", gloss: "to help"))
        guard case .waiting = model.chart else { Issue.record("\(String(describing: model.chart))"); return }
        #expect(!model.isTableOpen)
    }

    @Test func theBarNamesTheChosenForm() throws {
        try rig.show("نصر", form: .viii)
        #expect(model.verbName == .init(citation: "اِنْتَصَرَ يَنْتَصِرُ", gloss: "to triumph / to be victorious"))
    }

    @Test func searchingKeepsTheVerbToGoBackTo() throws {
        try rig.show("نصر", form: .viii)
        let verb = try #require(model.chosen)
        model.startSearching()
        model.search("كتب")
        #expect(model.stage == .searching(query: "كتب", returningTo: verb))
        model.cancelSearch()
        #expect(model.stage == .reading(verb))
    }

    @Test func thePickersAndTheChartAreHiddenWhileSearching() throws {
        try rig.show("خرج")
        model.startSearching()
        #expect(model.chart == nil)
        #expect(model.forms.isEmpty)
        #expect(model.majhulGap == nil)
        #expect(model.verbName == nil)
    }

    @Test func aPickerDoesNothingWhileSearching() {
        model.select(tense: .amr)
        model.select(voice: .majhul)
        model.select(mood: .jazm)
        model.select(form: .ii)
        #expect(model.tense == .madi && model.voice == .malum && model.mood == .raf)
        #expect(model.stage == .searching(query: "", returningTo: nil))
    }

    // MARK: Forms

    @Test func everyFormTheVerbHasIsAChipInOrder() throws {
        try rig.show("كتب")
        #expect(model.forms.map(\.form) == [.i, .ii, .iii, .iv, .vi, .viii, .x])
        let wazn = Dictionary(uniqueKeysWithValues: model.forms.map { ($0.form, $0.wazn) })
        #expect(wazn[.i] == "فَعَلَ")
        #expect(wazn[.ii] == "فَعَّلَ")
        #expect(wazn[.x] == "اِسْتَفْعَلَ")
    }

    /// Form I carries the bāb's vowel; the others are the same for every verb.
    @Test func formIsPatternFollowsTheVerbsBab() throws {
        try rig.show("سمع")
        #expect(model.forms.first?.wazn == "فَعِلَ")
        try rig.show("كتب")
        #expect(model.forms.first?.wazn == "فَعَلَ")
    }

    @Test func formIXHasAChipAndNoChart() throws {
        try rig.show("حمر", form: .ix)
        #expect(model.forms.map(\.form) == [.ii, .ix])
        #expect(model.forms.last?.wazn == "اِفْعَلَّ")
        #expect(model.verbName?.citation == "اِحْمَرَّ يَحْمَرُّ")
        #expect(model.chart == .missing)
    }

    /// The engine has no word yet, so the bar has no citation and says nothing.
    @Test func formVIIIOfTwoVerbsHasAChipAndNoCitationOrChart() throws {
        for key in ["ضرب", "دعو"] {
            try rig.show(key, form: .viii)
            #expect(model.forms.contains { $0.form == .viii && $0.wazn == "اِفْتَعَلَ" }, "\(key)")
            #expect(model.verbName?.citation == nil, "\(key)")
            #expect(model.chart == .missing, "\(key)")
        }
    }

    // MARK: Pickers

    @Test func theLineNamesTheChartAndCountsItsWords() throws {
        try rig.show("نصر")
        #expect(model.chart == .waiting(.init(form: .i, tense: .madi, voice: .malum, mood: nil, rowCount: 14)))
        model.select(tense: .mudari)
        #expect(model.chart == .waiting(.init(form: .i, tense: .mudari, voice: .malum, mood: .raf, rowCount: 14)))
    }

    @Test func theCommandHasNeitherVoiceNorMood() throws {
        try rig.show("نصر")
        model.select(tense: .amr)
        #expect(!model.showsVoice && !model.showsMood)
        #expect(model.chart == .waiting(.init(form: .i, tense: .amr, voice: nil, mood: nil, rowCount: 6)))
    }

    @Test func onlyThePresentHasAMood() throws {
        try rig.show("نصر")
        #expect(model.showsVoice && !model.showsMood)
        model.select(tense: .mudari)
        #expect(model.showsVoice && model.showsMood)
    }

    /// The command has no passive, but flipping back finds the passive again.
    @Test func aHiddenPickerKeepsItsChoice() throws {
        try rig.show("كتب")
        model.select(tense: .mudari)
        model.select(voice: .majhul)
        model.select(mood: .nasb)
        model.select(tense: .amr)
        guard case .waiting(let line) = model.chart else { Issue.record("no chart"); return }
        #expect(line.voice == nil && line.mood == nil)
        model.viewTable()
        guard case .open(_, let rows) = model.chart else { Issue.record("not open"); return }
        let amr = try #require(ChartShape(tense: .amr, voice: .malum, mood: nil))
        let active = try #require(try rig.words("كتب", .i, amr))
        #expect(rows.map(\.word) == Tense.amr.slots.map { active[$0]! })
        model.select(tense: .mudari)
        #expect(model.voice == .majhul && model.mood == .nasb)
        #expect(model.chart == .waiting(.init(form: .i, tense: .mudari, voice: .majhul, mood: .nasb, rowCount: 14)))
    }

    @Test func rowsAreInSarfOrderWithTheEnginesWords() throws {
        try rig.show("كتب")
        model.select(tense: .mudari)
        model.select(mood: .jazm)
        model.viewTable()
        guard case .open(_, let rows) = model.chart else { Issue.record("not open"); return }
        let jazm = try #require(ChartShape(tense: .mudari, voice: .malum, mood: .jazm))
        let words = try #require(try rig.words("كتب", .i, jazm))
        #expect(rows.map(\.slot) == PronounSlot.allCases)
        #expect(rows.map(\.word) == PronounSlot.allCases.map { words[$0]! })
    }

    // MARK: The table waits

    @Test func viewingOpensTheChartThatWasAskedFor() throws {
        try rig.show("كتب")
        model.viewTable()
        #expect(model.isTableOpen)
        guard case .open(let line, let rows) = model.chart else { Issue.record("not open"); return }
        #expect(line.rowCount == rows.count)
    }

    @Test func changingAnyChoicePutsTheTableAway() throws {
        let changes: [(String, (TablesModel) -> Void)] = [
            ("a form", { $0.select(form: .ii) }),
            ("the tense", { $0.select(tense: .mudari) }),
            ("the voice", { $0.select(voice: .majhul) }),
            ("the mood", { $0.select(mood: .nasb) }),
        ]
        for (name, change) in changes {
            try rig.show("كتب")
            model.viewTable()
            #expect(model.isTableOpen, "\(name)")
            change(model)
            guard case .waiting = model.chart else { Issue.record("\(name): \(String(describing: model.chart))"); continue }
            #expect(!model.isTableOpen, "\(name)")
        }
    }

    @Test func choosingAnotherVerbPutsTheTableAway() throws {
        try rig.show("كتب")
        model.viewTable()
        try rig.show("نصر")
        #expect(!model.isTableOpen)
    }

    @Test func selectingTheSameValueIsNotAChange() throws {
        try rig.show("كتب")
        model.viewTable()
        model.select(form: .i)
        model.select(tense: .madi)
        model.select(voice: .malum)
        model.select(mood: .raf)
        #expect(model.isTableOpen)
    }

    /// Changing a choice and changing it back still asks for the button.
    @Test func changingAChoiceBackDoesNotReopenTheTable() throws {
        try rig.show("كتب")
        model.viewTable()
        model.select(tense: .mudari)
        model.select(tense: .madi)
        #expect(!model.isTableOpen)
    }

    @Test func theTableSurvivesASearchThatIsCancelled() throws {
        try rig.show("كتب")
        model.viewTable()
        model.startSearching()
        model.cancelSearch()
        guard case .open = model.chart else { Issue.record("\(String(describing: model.chart))"); return }
    }

    @Test func thereIsNothingToViewWithoutAChart() throws {
        model.viewTable()
        #expect(!model.isTableOpen)
        try rig.show("حمر", form: .ix)
        model.viewTable()
        #expect(!model.isTableOpen)
    }

    // MARK: The passive

    @Test func aVerbWithAnObjectHasAPassive() throws {
        try rig.show("كتب")
        #expect(model.majhulGap == nil)
    }

    @Test func anIntransitiveVerbSaysSo() throws {
        try rig.show("خرج")
        #expect(model.majhulGap == .intransitive(pastWord: "خَرَجَ"))
    }

    /// A form with no chart names itself from its citation.
    @Test func formIXNamesItselfFromItsStems() throws {
        try rig.show("حمر", form: .ix)
        #expect(model.majhulGap == .intransitive(pastWord: "اِحْمَرَّ"))
    }

    /// With no citation there is no word to name.
    @Test func aVerbWithNoCitationNamesNoWord() throws {
        try rig.show("ضرب", form: .viii)
        #expect(model.majhulGap == .intransitive(pastWord: nil))
    }

    /// The sentence names the form on screen, not Form I.
    @Test func formVIISaysItsOwnWord() throws {
        try rig.show("كسر", form: .vii)
        #expect(model.majhulGap == .intransitive(pastWord: "اِنْكَسَرَ"))
    }

    /// The wording above says "intransitive" for every case, so this has to hold.
    @Test func everyFormWithoutAPassiveInTheLexiconIsIntransitive() {
        for root in rig.lexicon.roots {
            for (form, details) in root.forms where !rig.conjugation.hasPassive(root, form: form) {
                #expect(!details.isTransitive, "\(root.key) Form \(form.rawValue)")
            }
        }
    }

    @Test func movingToAVerbWithoutAPassiveLeavesMaarufSelected() throws {
        try rig.show("كتب")
        model.select(voice: .majhul)
        try rig.show("خرج")
        #expect(model.voice == .malum)
        guard case .waiting(let line) = model.chart else { Issue.record("no chart"); return }
        #expect(line.voice == .malum)
    }

    /// The choice is not given back when the student returns to a verb with one.
    @Test func majhulIsNotRestoredAfterTheFallback() throws {
        try rig.show("كتب")
        model.select(voice: .majhul)
        try rig.show("خرج")
        try rig.show("كتب")
        #expect(model.voice == .malum)
    }

    @Test func movingToAFormWithoutAPassiveLeavesMaarufSelected() throws {
        try rig.show("كسر")
        model.select(voice: .majhul)
        model.select(form: .vii)
        #expect(model.voice == .malum)
    }

    @Test func aMajhulChoiceHiddenByTheCommandFallsBackToo() throws {
        try rig.show("كتب")
        model.select(voice: .majhul)
        model.select(tense: .amr)
        try rig.show("خرج")
        #expect(model.voice == .malum)
    }

    @Test func majhulIsKeptWhereThereIsAPassive() throws {
        try rig.show("كتب")
        model.select(voice: .majhul)
        try rig.show("نصر")
        #expect(model.voice == .majhul)
    }

    // MARK: Redrawing

    @Test func aScreenThatReadTheChartIsRedrawnWhenAPickerChanges() throws {
        try rig.show("كتب")
        let changed = Mutex(false)
        withObservationTracking {
            _ = model.chart
        } onChange: {
            changed.withLock { $0 = true }
        }
        model.select(tense: .amr)
        #expect(changed.withLock { $0 })
    }
}
