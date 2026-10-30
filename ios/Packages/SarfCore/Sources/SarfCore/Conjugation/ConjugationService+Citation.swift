// How a verb is named.

extension ConjugationService {
    /// A verb's dictionary name: its past 3ms and present 3ms.
    ///
    ///     كتب, Form I   →   "كَتَبَ يَكْتُبُ"
    ///
    /// Both words are needed because together they show the bāb. Form IX has no
    /// chart, so its name comes from the conjugator's stems instead. Nil if the
    /// verb has no name: the root doesn't use the form, or there is no engine.
    ///
    /// Used by: quiz explanations ("from كَتَبَ يَكْتُبُ"), the bāb question, the
    /// Tables title.
    public func citation(_ root: Root, form: VerbForm) -> String? {
        guard root.forms[form] != nil else { return nil }
        guard conjugates(form) else { return recognitionCitation(root, form: form) }

        let madi = conjugate(ConjugationSpec(root: root, form: form, shape: .madiMalum), slot: .p3ms)
        let mudari = conjugate(ConjugationSpec(root: root, form: form, shape: .mudariMalumRaf), slot: .p3ms)
        guard let madi, let mudari else { return nil }
        return "\(madi) \(mudari)"
    }
}
