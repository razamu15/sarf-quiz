// The chart the shown verb and the pickers name, and what the screen needs to
// draw them.

import SarfCore

extension TablesModel {
    /// The chart for the shown verb, or nil while searching.
    ///
    /// Used by: the button under the pickers, the line above it, the table.
    var chart: Chart? {
        guard let verb = chosen else { return nil }
        let spec = ConjugationSpec(root: verb.root, form: verb.form, shape: shape)
        guard let words = conjugation.fullTable(spec) else { return .missing }
        // The count comes from the words, so a chart with a gap says so.
        let rows = tense.slots.compactMap { slot in words[slot].map { ChartRow(slot: slot, word: $0) } }
        let line = ChartLine(
            form: verb.form,
            tense: tense,
            voice: showsVoice ? voice : nil,
            mood: showsMood ? mood : nil,
            rowCount: rows.count)
        return isTableOpen ? .open(line, rows: rows) : .waiting(line)
    }

    /// The command has no voice. The picker is hidden and the line leaves it out.
    var showsVoice: Bool { tense != .amr }

    /// Only the present has a mood.
    var showsMood: Bool { tense == .mudari }

    /// The chart the pickers name. A remembered voice or mood that the tense
    /// doesn't use is not part of it.
    private var shape: ChartShape {
        let named = ChartShape(tense: tense, voice: tense == .amr ? .malum : voice, mood: tense == .mudari ? mood : nil)
        guard let named else { preconditionFailure("\(tense) \(voice) \(mood) is not one of the nine charts") }
        return named
    }

    /// Why majhūl can't be picked for the shown verb, or nil if it can. Also nil
    /// while searching.
    ///
    /// Used by: the voice row.
    var majhulGap: MajhulGap? {
        guard let verb = chosen, !conjugation.hasPassive(verb.root, form: verb.form) else { return nil }
        let past = ConjugationSpec(root: verb.root, form: verb.form, shape: .madiMalum)
        return .intransitive(pastWord: conjugation.conjugate(past, slot: .p3ms))
    }

    /// What the word bar shows for the shown verb.
    ///
    /// Used by: the word bar.
    var verbName: VerbName? {
        guard let verb = chosen else { return nil }
        return VerbName(citation: conjugation.citation(verb.root, form: verb.form), gloss: verb.details.gloss)
    }

    /// One chip for every form the shown verb has, in order from I to X.
    ///
    /// Used by: the form chips.
    var forms: [FormOption] {
        guard let verb = chosen else { return [] }
        return verb.root.recordedForms.map {
            FormOption(form: $0, wazn: conjugation.waznName(form: $0, bab: verb.root.bab(for: $0)))
        }
    }
}
