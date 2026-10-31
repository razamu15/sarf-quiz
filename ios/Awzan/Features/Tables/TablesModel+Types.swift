// The values the Tables model hands to its screen.

import SarfCore

extension TablesModel {
    /// A verb in one of its forms, with that form's details.
    ///
    ///     نصر in Form VIII   →   اِنْتَصَرَ, "to triumph"
    ///
    /// Used by: TablesModel (what is chosen), the word bar and the form chips.
    struct ChosenVerb: Equatable {
        let root: Root
        let form: VerbForm
        /// The meaning, the bāb and whether it takes an object.
        let details: RootForm

        /// Nil if the root isn't used in that form.
        init?(_ root: Root, _ form: VerbForm) {
            guard let details = root.forms[form] else { return nil }
            self.root = root
            self.form = form
            self.details = details
        }
    }

    /// What the word bar is doing. It is searching or showing a verb, never both.
    ///
    /// Used by: the word bar, and every section that shows only while a verb is shown.
    enum Stage: Equatable {
        /// Typing a search. `returningTo` is the verb the ✕ goes back to; nil on the
        /// first open, when there is none.
        case searching(query: String, returningTo: ChosenVerb?)
        case reading(ChosenVerb)
    }

    /// One row of the search: a verb, named by the form the row opens in.
    ///
    ///     قول    قَالَ يَقُولُ   "to say"   7 forms   .ajwaf
    ///
    /// Used by: the search results list.
    struct SearchResult: Identifiable, Equatable {
        let root: Root
        /// Form I, or the root's first form when it has no Form I.
        let form: VerbForm
        /// Nil when the engine can't write one for that form.
        let citation: String?
        let gloss: String
        let formCount: Int
        let group: VerbTypeGroup

        var id: String { root.key }
    }

    /// What the word bar calls the chosen verb.
    ///
    /// Used by: the word bar.
    struct VerbName: Equatable {
        /// Nil when the engine can't write one (Form VIII of ضرب).
        let citation: String?
        let gloss: String
    }

    /// A form chip: the form and its pattern.
    ///
    ///     II   فَعَّلَ
    ///
    /// Used by: the form chips.
    struct FormOption: Identifiable, Equatable {
        let form: VerbForm
        /// Nil for Form I when the verb's bāb isn't recorded.
        let wazn: String?

        var id: VerbForm { form }
    }

    /// Why a verb has no passive.
    ///
    /// Used by: the voice row, to switch majhūl off and say why.
    enum MajhulGap: Equatable {
        /// The verb takes no object. `pastWord` is the verb the sentence names
        /// ("خَرَجَ is intransitive"); nil when the engine can't write it.
        case intransitive(pastWord: String?)
    }

    /// The words that name a chart.
    ///
    ///     Form I · māḍī · maʿrūf · 14
    ///
    /// Used by: the line above "View the table", and the title of the table.
    struct ChartLine: Equatable {
        let form: VerbForm
        let tense: Tense
        /// Nil for the command, which has no voice.
        let voice: Voice?
        /// Nil unless the tense is the present.
        let mood: Mood?
        /// How many words the chart has: 14, or 6 for the command.
        let rowCount: Int
    }

    /// One row of the table: a pronoun's word.
    ///
    /// Used by: the table.
    struct ChartRow: Identifiable, Equatable {
        let slot: PronounSlot
        let word: String

        var id: PronounSlot { slot }
    }

    /// What the choices on the screen come to.
    ///
    /// Used by: the button under the pickers, and the table.
    enum Chart: Equatable {
        /// The engine has no chart for this choice. There is no button.
        case missing
        /// The chart exists and waits for "View the table".
        case waiting(ChartLine)
        /// The chart is on screen.
        case open(ChartLine, rows: [ChartRow])
    }
}
