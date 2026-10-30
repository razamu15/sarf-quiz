// The engine for one verb group.

/// Builds words for one verb group. ConjugationService has already checked that
/// the word can exist, so a conjugator only builds. It answers nil when its own
/// tables have no pattern for the word.
///
/// Used by: ConjugationService, the only caller. Implemented by each group's
/// engine and by the corpus stand-in.
///
/// FUTURE FIX, segmented output: a word split into prefix, stem and suffix, for
/// marking the sign and colouring affixes. It would be one more requirement here,
/// with a default of nil, so adding it breaks no conjugator.
protocol VerbTypeConjugator: Sendable {
    /// One word: the chart `spec` names, at one pronoun slot.
    func conjugate(_ spec: ConjugationSpec, slot: PronounSlot) -> String?

    /// The whole chart, one word per slot. A slot with no word is left out.
    /// Override to build the chart in one pass.
    func conjugateTable(_ spec: ConjugationSpec) -> [PronounSlot: String]

    /// The ism fāʿil, ism mafʿūl or masdar of a root in a form.
    func derivedNoun(root: Root, form: VerbForm, type: DerivedNounType) -> String?

    /// The citation of a form that isn't conjugated (Form IX), built from its
    /// stems, for example اِحْمَرَّ يَحْمَرُّ. Only the sālim engine has these.
    func recognitionCitation(root: Root, form: VerbForm) -> String?
}

extension VerbTypeConjugator {
    func conjugateTable(_ spec: ConjugationSpec) -> [PronounSlot: String] {
        var table: [PronounSlot: String] = [:]
        for slot in spec.tense.slots {
            if let word = conjugate(spec, slot: slot) { table[slot] = word }
        }
        return table
    }

    func recognitionCitation(root: Root, form: VerbForm) -> String? { nil }
}
