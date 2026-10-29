// What the lexicon records about one root in one form. Port of the per-form
// record in web-prototype/js/lexicon/roots.js (RECORD SHAPE), as exported to
// roots.json by tools/export-content.mjs.
//
// Two fields of the JS record are NOT here, on purpose: `note` and `reverso` are
// authoring aids the app never reads, and `manualTables` is a dead fallback kept
// only as JS test fixtures. The exporter leaves them out (see its header).

/// What the lexicon says about one root in one verb form: its meaning, whether it
/// takes an object, and the few facts an engine cannot derive from the radicals.
///
/// Optional fields are optional because the DOMAIN says they may not apply, and
/// each says which — never because a value was hard to find. roots.json omits a
/// field that does not apply; it never writes a default for it.
///
/// Called by: `Root.forms` (the only owner); the engines through `ConjugationSpec`
/// (S0.5) — `bab`, `faaDrops`, `masdar` and `isTransitive` are engine inputs;
/// MeaningService (S0+) for `gloss` and `english`; the Tables screen's search (S1.4)
/// for `gloss`.
public struct RootFormUsage: Hashable, Sendable, Decodable {
    /// Which of the six abwāb this root uses in Form I — the SURFACE vowels, the
    /// ones you can hear (نَامَ يَنَامُ is `aa`, not the `ia` of the unattested
    /// نَوِمَ), because the engines read this to pick the muḍāriʿ vowel.
    ///
    /// Non-nil on Form I only: the mazīd forms are templatic and have no bāb, and
    /// the loader rejects one that carries it. A Form I with no bāb recorded stays
    /// `nil` all the way to the engine, which answers "no word" — a visible gap, not
    /// نَصَرَ (see `Bab`).
    public let bab: Bab?

    /// Does the verb take a direct object? Majhūl questions only make sense when it
    /// does, and an intransitive form has no `ismMaful` (ConjugationService, S0.5).
    /// The JSON key is `trans`.
    public let isTransitive: Bool

    /// The recorded verbal noun. Form I's maṣdar is samāʿī — it varies per root and
    /// cannot be derived — so it is stored here, and `ConjugationService.derivedNoun`
    /// reads it for Form I only. The lexicon also records 99 mazīd-form maṣādir
    /// which the JS service never reads (their forms come from templates); that is
    /// logged in IOS_PORT_PLAN's follow-ups, and they are carried here unchanged.
    public let masdar: String?

    /// Mithāl-wāw bāb `ia` only: does the fāʾ (the wāw) drop in the muḍāriʿ?
    /// وَسِعَ يَسَعُ drops it (`true`); وَجِلَ يَوْجَلُ keeps it (`false`). The vowel
    /// pair cannot tell them apart because they share it, so the lexicon states it
    /// per root. `nil` means "not stated" — the mithāl engine reads it for that one
    /// bāb and nowhere else. Nothing enforces that it appears only there, by the
    /// JS's own decision: it is content, and a validator would be a second owner of
    /// a rule the lexicon already states.
    public let faaDrops: Bool?

    /// The meaning of this form, as it is shown: "to write", "to make (someone)
    /// write". Glosses beginning "to be …" are conjugated by MeaningService from the
    /// copula and carry no `english`.
    public let gloss: String

    /// The English verb's principal parts, for building a meaning from a slot.
    /// `nil` only ever for a "to be …" gloss (see `gloss`) — though some "to be"
    /// glosses carry one anyway. LexiconTests checks that, rather than the loader
    /// enforcing it, since MeaningService owns how a "to be" gloss is read.
    public let english: EnglishForms?

    private enum CodingKeys: String, CodingKey {
        case bab, masdar, faaDrops, gloss
        case isTransitive = "trans"
        case english = "en"
    }

    /// Required fields use `decode`, optional ones `decodeIfPresent` — the same
    /// split the exporter writes. A missing `trans` or `gloss` is a stale or broken
    /// file and throws.
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

/// The English principal parts of a verb: "wrote", "written", "writes", "writing".
///
/// The JSON keys are the terse `past`, `pp`, `pres3`, `ing`; the properties spell
/// them out, since this is the one place a reader meets them cold.
///
/// Called by: MeaningService (S0+), which builds "he wrote" / "it was written" /
/// "writing (the act itself)" from these.
public struct EnglishForms: Hashable, Sendable, Decodable {
    /// "wrote" — the simple past.
    public let past: String

    /// "written" — present only for transitive forms: it is what a majhūl meaning
    /// and an `ismMaful` are built from, and an intransitive verb has neither.
    /// LexiconTests checks that no intransitive form carries one.
    public let pastParticiple: String?

    /// "writes" — third-person singular present.
    public let thirdPersonPresent: String

    /// "writing" — the gerund, which is also how a maṣdar is glossed.
    public let gerund: String

    private enum CodingKeys: String, CodingKey {
        case past
        case pastParticiple = "pp"
        case thirdPersonPresent = "pres3"
        case gerund = "ing"
    }
}
