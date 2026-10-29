// Helpers for Arabic words that aren't about conjugation.

/// Splits an Arabic word into the letters a reader sees, and compares words by
/// them.
///
/// Used by: grading (to find where a typed answer went wrong), the hamza-seating
/// pass, the answer diff on the quiz screen.
public enum ArabicText {
    /// A word as its visible letters, each with its vowel marks.
    ///
    ///     تُنْصَرَانِ  →  تُ  نْ  صَ  رَ  ا  نِ
    ///
    /// A letter and its marks are one `Character`, so an index never lands on a
    /// loose vowel mark.
    ///
    /// Used by: `firstDifferingCluster`, the hamza-seating pass, the answer diff.
    public static func clusters(_ word: String) -> [Character] {
        Array(word)
    }

    /// The index of the first letter where two words differ, or nil if they are
    /// the same. If one word is the start of the other, it is the length of the
    /// shorter one.
    ///
    ///     تُنْصَرَانَ vs تُنْصَرَانِ  →  5   (the fatha and kasra on the last نـ)
    ///
    /// Swift compares marks by meaning, so a shadda typed before or after a vowel
    /// counts as the same.
    ///
    /// Used by: grading, to mark where a typed answer diverged.
    public static func firstDifferingCluster(_ a: String, _ b: String) -> Int? {
        let ca = clusters(a)
        let cb = clusters(b)
        let shared = min(ca.count, cb.count)
        for i in 0..<shared where ca[i] != cb[i] { return i }
        return ca.count == cb.count ? nil : shared
    }
}
