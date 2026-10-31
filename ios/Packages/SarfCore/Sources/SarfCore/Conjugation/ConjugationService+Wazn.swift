// The patterns (awzan): the same words, built on the reference root ف-ع-ل.

extension ConjugationService {
    /// The reference root's letters: ف ع ل.
    ///
    /// Used by: waznRoot, CorpusConjugator (to tell it from a lexicon root).
    static let waznRadicals = Radicals(fa: "ف", ayn: "ع", lam: "ل")

    /// The reference root, as a lexicon entry the engines can conjugate. It is
    /// sālim, so it shows a pattern with no weak letters in the way.
    ///
    /// `bab` matters for Form I only. The root has no meaning, so its `gloss` is
    /// empty.
    ///
    /// Used by: the wazn methods below, the Tables form chips, Compare.
    public static func waznRoot(form: VerbForm, bab: Bab?) -> Root {
        Root(
            radicals: waznRadicals,
            verbType: .salim,
            forms: [form: RootForm(bab: bab, isTransitive: true, masdar: nil, faaDrops: nil, gloss: "", english: nil)])
    }

    /// One word of a pattern.
    ///
    ///     Form X, present active raf, 3ms   →   "يَسْتَفْعِلُ"
    ///
    /// Nil for Form I without a bāb, rather than show the wrong pattern.
    ///
    /// Used by: the quiz generator, to add "on the pattern of ..." to an explanation.
    public func waznOf(form: VerbForm, shape: ChartShape, slot: PronounSlot, bab: Bab?) -> String? {
        let spec = ConjugationSpec(root: Self.waznRoot(form: form, bab: bab), form: form, shape: shape)
        return conjugate(spec, slot: slot)
    }

    /// A derived noun of a pattern.
    ///
    ///     Form X, ismFail   →   "مُسْتَفْعِل"
    ///
    /// Used by: the quiz generator, for the wazn note on derived-noun questions.
    public func waznOfDerived(form: VerbForm, type: DerivedNounType, bab: Bab?) -> String? {
        derivedNoun(Self.waznRoot(form: form, bab: bab), form: form, type: type)
    }

    /// A pattern's name, the way a verb's is.
    ///
    ///     Form II   →   "فَعَّلَ يُفَعِّلُ"
    ///
    /// Used by: the Home screen, which lists the ten forms by it.
    public func waznCitation(form: VerbForm, bab: Bab?) -> String? {
        citation(Self.waznRoot(form: form, bab: bab), form: form)
    }

    /// The first word of a pattern's name, which is how a form chip names it.
    ///
    ///     Form II   →   "فَعَّلَ"
    ///     Form IX   →   "اِفْعَلَّ"
    ///
    /// Nil for Form I without a bāb.
    ///
    /// Used by: the Tables form chips.
    public func waznName(form: VerbForm, bab: Bab?) -> String? {
        waznCitation(form: form, bab: bab)?.split(separator: " ").first.map(String.init)
    }
}
