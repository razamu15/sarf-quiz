// Which table a word belongs to: tense, voice and mood, and the nine valid
// combinations of them.
//
// A table is a ChartShape plus a root and a form. A PronounSlot then picks one
// row of it.

/// Past (madi), present (mudari) or command (amr).
public enum Tense: String, CaseIterable, Codable, Sendable {
    case madi, mudari, amr
}

/// Active (malum) or passive (majhul).
public enum Voice: String, CaseIterable, Codable, Sendable {
    case malum, majhul
}

/// The three endings of the present verb: raf (يَكْتُبُ), nasb (يَكْتُبَ) and
/// jazm (يَكْتُبْ). Only the present has a mood.
public enum Mood: String, CaseIterable, Codable, Sendable {
    case raf, nasb, jazm
}

/// One of the nine charts a verb can be shown in.
///
///     past       active, passive
///     present    active and passive, each in raf, nasb, jazm
///     command    active only
///
/// `mood` is nil for past and command, which have no mood.
///
/// The failable init only accepts these nine, so any ChartShape you hold is
/// valid. Decoding goes through the same check.
///
/// Used by: ConjugationService (which chart to build), the quiz plan (which
/// charts to draw from), the Tables screen.
public struct ChartShape: Hashable, Sendable, Codable {
    public let tense: Tense
    public let voice: Voice
    public let mood: Mood?

    /// Nil unless (tense, voice, mood) is one of the nine in `all`.
    public init?(tense: Tense, voice: Voice, mood: Mood?) {
        switch tense {
        case .madi:
            guard mood == nil else { return nil }
        case .mudari:
            guard mood != nil else { return nil }
        case .amr:
            // The command has no passive and no mood.
            guard voice == .malum, mood == nil else { return nil }
        }
        self.tense = tense
        self.voice = voice
        self.mood = mood
    }

    /// Unchecked init, only for the `all` list below.
    private init(_ tense: Tense, _ voice: Voice, _ mood: Mood?) {
        self.tense = tense
        self.voice = voice
        self.mood = mood
    }

    /// The nine charts, in the order the Tables screen shows them.
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
        // `mood` must be present, even when it is null.
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
        // Written as an explicit null, never left out.
        try container.encode(mood, forKey: .mood)
    }
}
