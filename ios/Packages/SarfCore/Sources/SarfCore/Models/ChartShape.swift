// Which table a word lives in: the three axes tense, voice, mood, and the nine
// combinations of them that name a real chart. Port of TENSES / VOICES / MOODS /
// CHART_SHAPES / isValidShape in web-prototype/js/vocabulary.js.
//
// A chart is not an entity — it is a ChartShape plus a root and a form. The
// ṣīghah (PronounSlot) is NOT one of these axes: a shape names the whole table,
// a slot indexes into it, and a word is the two together.

/// Past, present-future, command. The amr is a tense here and in every chart,
/// though English grammar would call it a mood: it has its own table, its own
/// six slots and its own label.
///
/// Raw values are a storage contract (see Vocabulary.swift).
public enum Tense: String, CaseIterable, Codable, Sendable {
    case madi, mudari, amr
}

/// Active (maʿlūm) or passive (majhūl). The amr has no passive.
public enum Voice: String, CaseIterable, Codable, Sendable {
    case malum, majhul
}

/// The three iʿrāb states of the muḍāriʿ: raised, subjunctive, jussive.
/// Belongs to the muḍāriʿ alone — see `ChartShape` for why a māḍī or amr never
/// carries one.
public enum Mood: String, CaseIterable, Codable, Sendable {
    case raf, nasb, jazm
}

/// One of the nine charts a root-in-a-form can be drawn as.
///
///     madi    malum  —        madi    majhul  —
///     mudari  malum  raf       mudari  majhul  raf
///     mudari  malum  nasb      mudari  majhul  nasb
///     mudari  malum  jazm      mudari  majhul  jazm
///     amr     malum  —
///
/// `mood` is `nil` for the māḍī and the amr, and that nil is the domain, not a
/// gap: the māḍī is mabnī on the fatḥa and the amr on the sukūn, so neither
/// bears iʿrāb. It is never defaulted to `.raf`.
///
/// THE INITIALISER IS THE SINGLE JUDGE. It returns nil for any combination that
/// is not one of the nine, so a `ChartShape` in hand is a real chart and no
/// downstream code re-checks. This replaces the prototype's `isValidShape`
/// predicate (and the constructor that used to default the voice and mood and
/// silently rewrite a combination that didn't fit — which let a manṣūb māḍī come
/// back as a rafʿ one instead of an error).
///
/// The amr is the case that bit in the prototype: the check once covered only
/// the mood half, so {amr, majhul} passed and the engine reached a null template.
/// The parse card flips a drawn word's voice, which can produce exactly that
/// combination — this is where it is refused.
///
/// Decoding goes through the same judge, and a missing `mood` key is an error
/// (golden-corpus.json writes `"mood": null`): absent is a stale file, null is
/// a māḍī.
///
/// Called by: ConjugationService (S0.5), whose chart precondition is "I was
/// handed a ChartShape"; QuizPlan.planCharts (S2.1) to enumerate; the parse
/// card's voice flip (S4), which uses the failable init and handles nil; the
/// corpus loader (S0.6) to decode each chart's axes.
public struct ChartShape: Hashable, Sendable, Codable {
    public let tense: Tense
    public let voice: Voice
    public let mood: Mood?

    /// Nil unless (tense, voice, mood) is one of `all`.
    public init?(tense: Tense, voice: Voice, mood: Mood?) {
        switch tense {
        case .madi:
            guard mood == nil else { return nil }
        case .mudari:
            guard mood != nil else { return nil }
        case .amr:
            // No iʿrāb AND no passive; both halves, or the engine is handed a
            // shape with no template (see the type's note).
            guard voice == .malum, mood == nil else { return nil }
        }
        self.tense = tense
        self.voice = voice
        self.mood = mood
    }

    /// For `all` only: the nine are written out below, so the literal is what a
    /// reader checks against the table in the doc comment. VocabularyTests
    /// proves it agrees with the failable init over all 24 combinations.
    private init(_ tense: Tense, _ voice: Voice, _ mood: Mood?) {
        self.tense = tense
        self.voice = voice
        self.mood = mood
    }

    /// The nine, in the order the Tables screen and golden-corpus.json list them.
    public static let all: [ChartShape] = [
        ChartShape(.madi,   .malum,  nil),
        ChartShape(.madi,   .majhul, nil),
        ChartShape(.mudari, .malum,  .raf),
        ChartShape(.mudari, .malum,  .nasb),
        ChartShape(.mudari, .malum,  .jazm),
        ChartShape(.mudari, .majhul, .raf),
        ChartShape(.mudari, .majhul, .nasb),
        ChartShape(.mudari, .majhul, .jazm),
        ChartShape(.amr,    .malum,  nil),
    ]

    private enum CodingKeys: String, CodingKey { case tense, voice, mood }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let tense = try container.decode(Tense.self, forKey: .tense)
        let voice = try container.decode(Voice.self, forKey: .voice)
        // `Mood?.self`, not decodeIfPresent: a missing key must throw.
        let mood = try container.decode(Mood?.self, forKey: .mood)
        guard let shape = ChartShape(tense: tense, voice: voice, mood: mood) else {
            throw DecodingError.dataCorruptedError(
                forKey: .tense, in: container,
                debugDescription: "\(tense)/\(voice)/\(String(describing: mood)) is not one of the nine charts")
        }
        self = shape
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(tense, forKey: .tense)
        try container.encode(voice, forKey: .voice)
        // Written as an explicit null, matching the corpus — never omitted.
        try container.encode(mood, forKey: .mood)
    }
}
