// A root as the lexicon holds it, and a root paired with one of its forms.

/// The three letters of a root, named by position: fa (first), ayn (second),
/// lam (third).
///
///     كتب    fa: ك   ayn: ت   lam: ب
///
/// Each one is a single bare letter, with no vowel mark.
///
/// Used by: Root, LexiconService.classify, every engine.
public struct Radicals: Hashable, Sendable, Decodable {
    public let fa: Unicode.Scalar
    public let ayn: Unicode.Scalar
    public let lam: Unicode.Scalar

    init(fa: Unicode.Scalar, ayn: Unicode.Scalar, lam: Unicode.Scalar) {
        self.fa = fa
        self.ayn = ayn
        self.lam = lam
    }

    /// The root as a string ("كتب"). It is how a root is looked up, and the id
    /// saved in quiz history.
    public var key: String { [fa, ayn, lam].map { String($0) }.joined() }

    /// roots.json writes the letters as an array: ["ك","ت","ب"].
    public init(from decoder: Decoder) throws {
        let letters = try decoder.singleValueContainer().decode([String].self)
        func corrupt(_ why: String) -> DecodingError {
            DecodingError.dataCorrupted(.init(
                codingPath: decoder.codingPath,
                debugDescription: "radicals \(letters): \(why)"))
        }
        guard letters.count == 3 else { throw corrupt("a root has exactly three radicals") }
        let scalars = try letters.map { letter -> Unicode.Scalar in
            // Must be one letter: not a letter plus a vowel mark, and not a mark alone.
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

/// One lexicon entry: a root, its verb type, and a `RootForm` for each form it is
/// used in.
///
///     كتب    salim    forms: I, II, III, IV, VI, VIII, X
///
/// Used by: LexiconService, ConjugationService, the Tables screen, the quiz.
public struct Root: Hashable, Sendable, Decodable {
    public let radicals: Radicals
    public let verbType: VerbType
    public let forms: [VerbForm: RootForm]

    /// The root as a string ("كتب"). See `Radicals.key`.
    public var key: String { radicals.key }

    /// The forms this root has, in order from I to X. (`forms` is a dictionary,
    /// so it has no order of its own.)
    public var recordedForms: [VerbForm] {
        VerbForm.allCases.filter { forms[$0] != nil }
    }

    /// This root's bab in the given form. Nil for forms II–X, which have none.
    ///
    /// Used by: the Form I engines, the quiz.
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
        // The file's form keys are strings ("I", "II", ...); an unknown one is an error.
        let raw = try container.decode([String: RootForm].self, forKey: .forms)
        var forms: [VerbForm: RootForm] = [:]
        for (key, rootForm) in raw {
            guard let form = VerbForm(rawValue: key) else {
                throw DecodingError.dataCorruptedError(
                    forKey: .forms, in: container,
                    debugDescription: "root \(radicals.key): unknown form \"\(key)\"")
            }
            forms[form] = rootForm
        }
        self.forms = forms
    }
}

/// A root paired with one of its forms, for example كتب in Form II. The details
/// of that form are in `root.forms[form]`.
///
/// Used by: LexiconService.candidates, the quiz word pool.
public struct RootInForm: Hashable, Sendable {
    public let root: Root
    public let form: VerbForm
}
