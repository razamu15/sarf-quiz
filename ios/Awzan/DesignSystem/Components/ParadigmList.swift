// The chart as a vertical list — one row per ṣīgha.
//
// 🔒 D-44: a list, not a grid, because that is the shape of the chart a student
// already owns and a list is what a long read wants. All fourteen rows on a
// small phone by SCROLLING, never by truncating.
//
// The three-column paradigm grid is not deleted — it is the *quiz's* peek
// (D-45). A glance mid-question wants the whole chart at once with its
// neighbours visible; a browse wants one row per ṣīgha and room to scroll. Same
// chart underneath, two shapes, and this is the browse one.
//
// Used by: Tables (D2). The quiz's peek falls back to it at the largest Dynamic
// Type sizes, which is why it takes rows rather than a chart object.

import SwiftUI

/// One ṣīgha: who, and the word.
public struct ParadigmRow: Identifiable, Equatable {
    /// The slot key — `"3ms"`. Identity, and what a caller keys its own data by.
    public let id: String
    /// The English pronoun: `he`, `you two (f)`.
    public let english: String
    /// The Arabic pronoun: `هُوَ`.
    public let arabic: String
    /// The conjugated word. **Never a placeholder** — a row the engine has no
    /// word for does not belong in the list at all.
    public let word: String

    public init(id: String, english: String, arabic: String, word: String) {
        self.id = id
        self.english = english
        self.arabic = arabic
        self.word = word
    }
}

/// The rows, in classic ṣarf order, as one bordered group.
///
/// Row count is **derived, never a fixed 14**: the amr conjugates the 2nd person
/// only and has six. A caller that hard-codes fourteen prints a wrong count on
/// the chart line above, which is the mistake the design's own screenshot 11
/// makes.
public struct ParadigmList: View {
    private let rows: [ParadigmRow]

    public init(_ rows: [ParadigmRow]) { self.rows = rows }

    public var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(rows.enumerated()), id: \.element.id) { index, row in
                ParadigmListRow(row)
                if index < rows.count - 1 {
                    Divider().overlay(Midad.line)
                }
            }
        }
        .background(Midad.raised)
        .overlay(
            RoundedRectangle(cornerRadius: Midad.radiusMd, style: .continuous)
                .strokeBorder(Midad.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: Midad.radiusMd, style: .continuous))
    }
}

private struct ParadigmListRow: View {
    private let row: ParadigmRow

    init(_ row: ParadigmRow) { self.row = row }

    var body: some View {
        HStack(spacing: Midad.space4) {
            Text(row.word.bidiIsolated)
                .typeStyle(.arabicTitle)
                .foregroundStyle(Midad.ink)
                // Never wrap an Arabic word onto a second line — a broken word
                // stops being readable as one word, and at the largest Dynamic
                // Type the whole row should shrink rather than the word break.
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Spacer(minLength: Midad.space4)
            VStack(alignment: .trailing, spacing: 0) {
                Text(row.arabic.bidiIsolated)
                    .typeStyle(.arabicLabel)
                    .foregroundStyle(Midad.inkMuted)
                Text(row.english.bidiIsolated)
                    .typeStyle(.caption)
                    .foregroundStyle(Midad.inkMuted)
            }
        }
        .padding(.horizontal, Midad.space4)
        .padding(.vertical, Midad.space1)
        // The row reads right to left: the word leads, the pronoun follows.
        .environment(\.layoutDirection, .rightToLeft)
        .accessibilityElement(children: .combine)
    }
}

#Preview("ParadigmList · نصر māḍī", traits: .sizeThatFitsLayout) {
    ParadigmList([
        ParadigmRow(id: "3ms", english: "he", arabic: "هُوَ", word: "نَصَرَ"),
        ParadigmRow(id: "3md", english: "they two (m)", arabic: "هُمَا", word: "نَصَرَا"),
        ParadigmRow(id: "3mp", english: "they (m)", arabic: "هُمْ", word: "نَصَرُوا"),
        ParadigmRow(id: "3fs", english: "she", arabic: "هِيَ", word: "نَصَرَتْ"),
        ParadigmRow(id: "2mp", english: "you (m, 3+)", arabic: "أَنْتُمْ", word: "نَصَرْتُم"),
        ParadigmRow(id: "1p", english: "we", arabic: "نَحْنُ", word: "نَصَرْنَا"),
    ])
    .padding(Midad.space4)
    .background(Midad.ground)
}
