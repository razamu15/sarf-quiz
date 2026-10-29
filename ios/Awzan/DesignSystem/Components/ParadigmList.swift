// The conjugation table as a vertical list: one row per pronoun, with the word on
// the right.
//
// Used by: the Tables screen.

import SwiftUI

/// One row: a pronoun and its word.
public struct ParadigmRow: Identifiable, Equatable {
    /// The slot key, such as `"3ms"`.
    public let id: String
    /// The English pronoun: `he`, `you two (f)`.
    public let english: String
    /// The Arabic pronoun: `هُوَ`.
    public let arabic: String
    /// The conjugated word. Every row has one; a slot with no word is left out.
    public let word: String

    public init(id: String, english: String, arabic: String, word: String) {
        self.id = id
        self.english = english
        self.arabic = arabic
        self.word = word
    }
}

/// The rows as one bordered group. The number of rows comes from the data (14,
/// or 6 for the command), so don't assume 14.
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
                // Shrink the word rather than wrap it onto a second line.
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
        // Right to left: the word first, then the pronoun.
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
