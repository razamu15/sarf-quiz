// The six patterns of the basic verb (Form I), and the three short vowels they
// are made of.

/// A short vowel: fatha (ـَ), damma (ـُ) or kasra (ـِ).
///
/// Used by: Bab, the grammar tables and word-building code.
public enum Haraka: CaseIterable, Sendable {
    case fatha, damma, kasra

    /// The vowel mark as a Unicode character, ready to put into a word.
    public var scalar: Unicode.Scalar {
        switch self {
        case .fatha: return "\u{064E}"
        case .damma: return "\u{064F}"
        case .kasra: return "\u{0650}"
        }
    }
}

/// The six patterns (abwab) of Form I, named by the vowel on the middle letter
/// in the past, then in the present:
///
///     au   نَصَرَ يَنْصُرُ    fatha, damma
///     ai   ضَرَبَ يَضْرِبُ    fatha, kasra
///     aa   فَتَحَ يَفْتَحُ    fatha, fatha
///     ia   سَمِعَ يَسْمَعُ    kasra, fatha
///     uu   كَرُمَ يَكْرُمُ    damma, damma
///     ii   حَسِبَ يَحْسِبُ    kasra, kasra
///
/// Only Form I has a bab. A Form I verb with no bab recorded stays nil; it is
/// never guessed.
///
/// Used by: RootForm, the Form I engines, the quiz.
public enum Bab: String, CaseIterable, Codable, Sendable {
    case au, ai, aa, ia, uu, ii

    /// The middle-letter vowel in the past and in the present.
    public var vowels: (madi: Haraka, mudari: Haraka) {
        switch self {
        case .au: return (.fatha, .damma)
        case .ai: return (.fatha, .kasra)
        case .aa: return (.fatha, .fatha)
        case .ia: return (.kasra, .fatha)
        case .uu: return (.damma, .damma)
        case .ii: return (.kasra, .kasra)
        }
    }

    public var madiVowel: Haraka { vowels.madi }
    public var mudariVowel: Haraka { vowels.mudari }
}
