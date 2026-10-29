// A root as the lexicon holds it, and the pair "a root in one of its forms".
// Port of the ROOTS record in web-prototype/js/lexicon/roots.js plus babOf from
// lexicon/root.js (which was split out only to avoid an import cycle, and has no
// reason to be in Swift: it is `Root.bab(for:)` below).

/// The three radicals of a triliteral root, named by the position each fills in
/// the wazn فَعَلَ: the fāʾ (first), the ʿayn (second) and the lām (third).
///
///     كتب   fa: ك   ayn: ت   lam: ب
///
/// Named, not indexed, because the weak-type names ARE positions: mithāl is a weak
/// fāʾ, ajwaf a weak ʿayn, nāqiṣ a weak lām, muḍāʿaf an ʿayn equal to the lām. An
/// engine reading `radicals.ayn` is reading the grammar.
///
/// A radical is exactly one Unicode scalar, and a letter — never a ḥaraka, never
/// two scalars. That is checked once, when roots.json is decoded, so everything
/// downstream (Templates, S0.7, works on scalars) can rely on it. The prototype
/// supports triliteral roots only (classify() destructures three), and so does
/// this: a quadriliteral root fails to decode rather than being truncated.
///
/// Called by: `Root`; `LexiconService.classify` (S0.3); every engine (S0.8
/// onward) to build a word from the root's letters; ConjugationService's
/// `waznRoot` (S0.5), which constructs ف ع ل.
public struct Radicals: Hashable, Sendable, Decodable {
    public let fa: Unicode.Scalar
    public let ayn: Unicode.Scalar
    public let lam: Unicode.Scalar

    init(fa: Unicode.Scalar, ayn: Unicode.Scalar, lam: Unicode.Scalar) {
        self.fa = fa
        self.ayn = ayn
        self.lam = lam
    }

    /// The root as the one string that names it: "كتب". The lexicon's lookup key
    /// and, in SarfQuiz, the stored `rootKey` of every WordSpec — a KEY rather than
    /// a reference, because the root it names may be gone from a later lexicon.
    public var key: String { [fa, ayn, lam].map { String($0) }.joined() }

    /// roots.json writes the radicals as an array of three one-letter strings:
    /// `["ك","ت","ب"]`.
    public init(from decoder: Decoder) throws {
        let letters = try decoder.singleValueContainer().decode([String].self)
        func corrupt(_ why: String) -> DecodingError {
            DecodingError.dataCorrupted(.init(
                codingPath: decoder.codingPath,
                debugDescription: "radicals \(letters): \(why)"))
        }
        guard letters.count == 3 else { throw corrupt("a root has exactly three radicals") }
        let scalars = try letters.map { letter -> Unicode.Scalar in
            // One scalar, and a letter: this rejects a radical carrying a ḥaraka
            // ("كَ" is two scalars) and a stray mark or digit ("َ" alone is a mark).
            guard letter.unicodeScalars.count == 1,
                  let scalar = letter.unicodeScalars.first,
                  scalar.properties.generalCategory == .otherLetter
            else { throw corrupt("\"\(letter)\" is not a single bare letter") }
            return scalar
        }
        fa = scalars[0]
        ayn = scalars[1]
        lam = scalars[2]
    }
}

/// One lexicon entry: a root, its verb type, and the forms it is recorded in.
///
/// `verbType` is the ENGINE type (`ajwafWaw`, not the group `ajwaf`); the loader
/// checks it against what the radicals imply (`LexiconService.classify`), so a
/// `Root` that exists has a type that is right.
///
/// `forms` is a dictionary and has no order, so "the first form" must never be
/// read off it: use `recordedForms`. (The prototype's Tables screen did read
/// `Object.keys(root.forms)[0]` and relied on insertion order — PORT_INVENTORY
/// §1.4.)
///
/// Called by: `LexiconService` (the only producer); ConjugationService (S0.5) as
/// the argument of every question; the Tables screen (S1) for its root list and
/// search; SarfQuiz's WordPool (S3) via `LexiconService.candidates`.
public struct Root: Hashable, Sendable, Decodable {
    public let radicals: Radicals
    public let verbType: VerbType
    public let forms: [VerbForm: RootFormUsage]

    /// "كتب" — see `Radicals.key`.
    public var key: String { radicals.key }

    /// The forms this root is recorded in, in Form I … X order — the stated answer
    /// to "what is its first form?" that a dictionary's iteration order is not.
    public var recordedForms: [VerbForm] {
        VerbForm.allCases.filter { forms[$0] != nil }
    }

    /// The bāb this root uses in this form, or `nil`: for every mazīd form (they
    /// have none) and for a Form I the lexicon has not recorded one for. An
    /// absence, never a default. Replaces the prototype's `babOf(root, formId)`.
    ///
    /// Called by: every Form I engine to pick a bāb-keyed stem (S0.8 onward); and
    /// SarfQuiz's WordSpec (S2.1), to stamp the bāb onto a stored identity so stats
    /// can slice by it without re-reading a lexicon that may have changed.
    public func bab(for form: VerbForm) -> Bab? {
        forms[form]?.bab
    }

    private enum CodingKeys: String, CodingKey {
        case radicals = "root"
        case verbType = "type"
        case forms
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        radicals = try container.decode(Radicals.self, forKey: .radicals)
        verbType = try container.decode(VerbType.self, forKey: .verbType)
        // JSON object keys are strings; each must name a real form, and an unknown
        // one (a typo, or a form this build does not know) is an error rather than
        // a silently dropped entry.
        let raw = try container.decode([String: RootFormUsage].self, forKey: .forms)
        var forms: [VerbForm: RootFormUsage] = [:]
        for (key, usage) in raw {
            guard let form = VerbForm(rawValue: key) else {
                throw DecodingError.dataCorruptedError(
                    forKey: .forms, in: container,
                    debugDescription: "root \(radicals.key): unknown form \"\(key)\"")
            }
            forms[form] = usage
        }
        self.forms = forms
    }
}

/// A root in one of the forms it is recorded in — the unit a chart is drawn of,
/// and what the quiz draws words from.
///
/// Called by: `LexiconService.candidates`, which produces them; SarfQuiz's
/// WordPool (S3) as the (root, form) half of a word's identity.
public struct RootForm: Hashable, Sendable {
    public let root: Root
    public let form: VerbForm
}
