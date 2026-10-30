// How one form of a root behaves: its meaning, and the few facts the engines
// can't work out from the letters alone.

/// How one specific form (Form I, II, V, VII, ...) behaves for a single root.
/// A root has one `RootForm` for each form it is used in.
///
///     كتب, Form II: "to make (someone) write", takes an object
///
/// Optional fields are nil when they don't apply; they are never filled with a
/// default.
///
/// Used by: Root.forms, the engines (bab, faaDrops, masdar, isTransitive), the
/// meaning builder (gloss, english), the Tables search (gloss).
public struct RootForm: Hashable, Sendable, Decodable {
    /// Form I only: which of the six patterns the verb follows. Nil for II–X.
    public let bab: Bab?

    /// Whether the verb takes an object. A passive only makes sense if it does.
    /// (`trans` in roots.json.)
    public let isTransitive: Bool

    /// The verbal noun. A Form I masdar can't be worked out from the letters, so
    /// it is stored. The engine only reads it for Form I.
    public let masdar: String?

    /// For a few verbs whose first letter is و: does it drop in the present?
    /// وَسِعَ يَسَعُ drops it (`true`); وَجِلَ يَوْجَلُ keeps it (`false`). Nil means
    /// not stated.
    public let faaDrops: Bool?

    /// The meaning, for example "to write".
    public let gloss: String

    /// The English verb parts, used to build meanings from the gloss. Nil for
    /// "to be ..." glosses. (`en` in roots.json.)
    public let english: EnglishForms?

    /// For forms built in code (the reference root, test roots).
    init(bab: Bab?, isTransitive: Bool, masdar: String?, faaDrops: Bool?, gloss: String, english: EnglishForms?) {
        self.bab = bab
        self.isTransitive = isTransitive
        self.masdar = masdar
        self.faaDrops = faaDrops
        self.gloss = gloss
        self.english = english
    }

    private enum CodingKeys: String, CodingKey {
        case bab, masdar, faaDrops, gloss
        case isTransitive = "trans"
        case english = "en"
    }

    /// `trans` and `gloss` must be present; the rest may be missing.
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        bab = try container.decodeIfPresent(Bab.self, forKey: .bab)
        isTransitive = try container.decode(Bool.self, forKey: .isTransitive)
        masdar = try container.decodeIfPresent(String.self, forKey: .masdar)
        faaDrops = try container.decodeIfPresent(Bool.self, forKey: .faaDrops)
        gloss = try container.decode(String.self, forKey: .gloss)
        english = try container.decodeIfPresent(EnglishForms.self, forKey: .english)
    }
}

/// The parts of an English verb: wrote, written, writes, writing.
///
/// Used by: the meaning builder.
public struct EnglishForms: Hashable, Sendable, Decodable {
    /// "wrote"
    public let past: String

    /// "written". Only transitive verbs have one.
    public let pastParticiple: String?

    /// "writes"
    public let thirdPersonPresent: String

    /// "writing"
    public let gerund: String

    /// roots.json uses short keys: past, pp, pres3, ing.
    private enum CodingKeys: String, CodingKey {
        case past
        case pastParticiple = "pp"
        case thirdPersonPresent = "pres3"
        case gerund = "ing"
    }
}
