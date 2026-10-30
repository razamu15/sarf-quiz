// The one door to conjugation.

/// The service was given engines that don't match `engineBacking`. A wiring
/// mistake in the app, never bad data.
enum ConjugationError: Error, Equatable, CustomStringConvertible {
    case backingMismatch(group: VerbTypeGroup, declared: EngineBacking, registered: Bool)

    var description: String {
        switch self {
        case let .backingMismatch(group, declared, registered):
            return "conjugation: group \(group.rawValue) is declared \(declared) but "
                + (registered ? "has a conjugator" : "has no conjugator")
        }
    }
}

/// The only way to ask for a word. It sends each root to its group's conjugator,
/// and it checks whether the word can exist at all, so the conjugators only build.
///
///     service.conjugate(spec, slot: .p3ms)   →   "كَتَبَ"
///
/// nil means "no such word". It also means "no engine for this group yet", so
/// call `hasEngine` or `availableTypes` first if you need to tell them apart.
///
/// The bāb goes to the conjugators exactly as the lexicon recorded it, including
/// nothing. Each conjugator decides what a missing one means.
///
/// Used by: the Tables screen, the quiz generator, the word pool.
public struct ConjugationService: Sendable {
    private let conjugators: [VerbTypeGroup: any VerbTypeConjugator]

    /// `conjugators` must hold one for every group that `engineBacking` says has
    /// something, and none for the rest.
    init(conjugators: [VerbTypeGroup: any VerbTypeConjugator]) throws {
        for group in VerbTypeGroup.allCases {
            let declared = engineBacking(for: group)
            let registered = conjugators[group] != nil
            guard (declared != .unbuilt) == registered else {
                throw ConjugationError.backingMismatch(group: group, declared: declared, registered: registered)
            }
        }
        self.conjugators = conjugators
    }

    // MARK: Facts about forms and types

    /// Does this verb type have anything that answers for it? A fact about the
    /// type, not about one form.
    ///
    /// Used by: LexiconService.availableTypes.
    func hasEngine(_ type: VerbType) -> Bool {
        conjugators[type.group] != nil
    }

    /// Does this form produce words at all? Only Form IX doesn't.
    ///
    /// Used by: the word pool, the Tables form chips.
    public func conjugates(_ form: VerbForm) -> Bool {
        form.facts.isConjugable
    }

    /// Can this verb be put in the passive in this form? Needs both: the form has
    /// a passive (Form VII doesn't), and the verb takes an object (خَرَجَ doesn't).
    /// False for a form the root isn't used in.
    ///
    /// Used by: chartExists, the Tables voice control (to disable it with a reason).
    public func hasPassive(_ root: Root, form: VerbForm) -> Bool {
        guard let rootForm = root.forms[form] else { return false }
        return form.facts.hasMajhul && rootForm.isTransitive
    }

    // MARK: Words

    /// One word, or nil if there isn't one.
    ///
    /// Used by: the quiz generator (prompt, answer and distractors), fullTable,
    /// citation.
    public func conjugate(_ spec: ConjugationSpec, slot: PronounSlot) -> String? {
        guard chartExists(spec), spec.tense.slots.contains(slot) else { return nil }
        return conjugator(for: spec.root)?.conjugate(spec, slot: slot)
    }

    /// The whole chart, one word per pronoun slot, or nil if it has no words.
    /// Keys are in no order; walk `spec.tense.slots` to get rows in order.
    ///
    /// Used by: the Tables screen.
    public func fullTable(_ spec: ConjugationSpec) -> [PronounSlot: String]? {
        guard chartExists(spec),
              let table = conjugator(for: spec.root)?.conjugateTable(spec),
              !table.isEmpty
        else { return nil }
        return table
    }

    /// The ism fāʿil, ism mafʿūl or masdar, or nil if the verb has none.
    ///
    ///     كتب, Form I, ismMaful   →   "مَكْتُوب"
    ///     خرج, Form I, ismMaful   →   nil   (no object, so no maf'ul)
    ///
    /// A Form I masdar isn't derived, so it is the one the lexicon recorded.
    ///
    /// Used by: the quiz generator's derived-noun questions, the wazn note.
    public func derivedNoun(_ root: Root, form: VerbForm, type: DerivedNounType) -> String? {
        // The engine check comes first, so a type with no engine gives no nouns
        // either, not even a recorded masdar.
        guard let conjugator = conjugator(for: root), let rootForm = root.forms[form] else { return nil }
        if type == .ismMaful && !rootForm.isTransitive { return nil }
        if type == .masdar && form == .i { return rootForm.masdar }
        if assimilatesTaa(root, form: form) { return nil }
        return conjugator.derivedNoun(root: root, form: form, type: type)
    }

    // MARK: Checks

    /// Can this chart exist? Every check that holds whatever the verb type, in
    /// one place. A conjugator never repeats them. What a verb type has no
    /// pattern for is the conjugator's own nil.
    func chartExists(_ spec: ConjugationSpec) -> Bool {
        // The root is used in this form.
        guard spec.root.forms[spec.form] != nil else { return false }
        // Form IX has no words.
        guard conjugates(spec.form) else { return false }
        // No passive for a verb without an object, or in Form VII.
        if spec.voice == .majhul && !hasPassive(spec.root, form: spec.form) { return false }
        // اِدَّعَى is not اِدْتَعَى, and no engine writes the first yet.
        if assimilatesTaa(spec.root, form: spec.form) { return false }
        return true
    }

    private func assimilatesTaa(_ root: Root, form: VerbForm) -> Bool {
        form == .viii && iftiaalAssimilatingFaa.contains(root.radicals.fa)
    }

    private func conjugator(for root: Root) -> (any VerbTypeConjugator)? {
        conjugators[root.verbType.group]
    }

    /// Used by: ConjugationService+Citation, which asks the conjugator directly.
    func recognitionCitation(_ root: Root, form: VerbForm) -> String? {
        conjugator(for: root)?.recognitionCitation(root: root, form: form)
    }
}
