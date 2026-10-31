// A grammar word as the app writes it: in Latin letters and in Arabic.

/// The name of a grammar idea, spelled both ways.
///
///     Tense.madi.term   →   "māḍī"   مَاضٍ
///
/// The Arabic has its vowels. A screen chooses which half to show: Tables'
/// tense row shows both, its voice row only the Latin.
///
/// Used by: the Tables pickers, chart line and search rows.
public struct Term: Equatable, Sendable {
    public let english: String
    public let arabic: String

    public init(_ english: String, _ arabic: String) {
        self.english = english
        self.arabic = arabic
    }
}
