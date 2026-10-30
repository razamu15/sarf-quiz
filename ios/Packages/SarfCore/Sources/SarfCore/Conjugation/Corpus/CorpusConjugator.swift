// A conjugator that reads the corpus instead of building words.

/// Looks words up in the exported corpus. It answers for every group whose own
/// engine isn't written yet, and answers nil for what the corpus doesn't hold.
///
/// The service has already checked that the word can exist, so a nil here means
/// the JS engine had no word either (ءخذ in Form VIII).
///
/// Used by: ConjugationService.load.
struct CorpusConjugator: VerbTypeConjugator {
    let corpus: GoldenCorpus

    func conjugate(_ spec: ConjugationSpec, slot: PronounSlot) -> String? {
        block(spec.root, spec.form)?.charts[spec.shape]?[slot]
    }

    func derivedNoun(root: Root, form: VerbForm, type: DerivedNounType) -> String? {
        block(root, form)?.derived[type]
    }

    /// The corpus names every form, Form IX included. The service only asks for
    /// the ones that have no chart to read a name from.
    func recognitionCitation(root: Root, form: VerbForm) -> String? {
        block(root, form)?.citation
    }

    /// The reference root is no lexicon entry, so it is looked up by pattern.
    /// Like the engines, only Form I reads a bāb: the other patterns are the
    /// same whatever one the caller passes.
    private func block(_ root: Root, _ form: VerbForm) -> CorpusBlock? {
        guard root.radicals != ConjugationService.waznRadicals else {
            return corpus.wazn[WaznKey(form: form, bab: form == .i ? root.bab(for: form) : nil)]
        }
        return corpus.roots[root.key]?[form]
    }
}
