// The list of verbs under the search field.

import SwiftUI

/// One row per matching verb, or a line saying nothing matched. Tapping a row
/// shows that verb.
///
/// Used by: the Tables screen, while searching.
struct VerbResultsSection: View {
    let model: TablesModel

    var body: some View {
        let results = model.results
        if results.isEmpty {
            Text(TablesCopy.nothingMatches(query).bidiIsolated)
                .typeStyle(.caption)
                .foregroundStyle(Midad.inkMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            VStack(spacing: 0) {
                ForEach(Array(results.enumerated()), id: \.element.id) { index, result in
                    Row(result: result) { model.choose(result) }
                    if index < results.count - 1 {
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

    private var query: String {
        if case .searching(let query, _) = model.stage { return query }
        return ""
    }

    private struct Row: View {
        let result: TablesModel.SearchResult
        let action: () -> Void

        var body: some View {
            Button(action: action) {
                HStack(spacing: Midad.space3) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(result.title.bidiIsolated)
                            .typeStyle(.arabicTitle)
                            .foregroundStyle(Midad.ink)
                            .lineLimit(1)
                        Text(result.subtitle.bidiIsolated)
                            .typeStyle(.caption)
                            .foregroundStyle(Midad.inkMuted)
                            .lineLimit(1)
                    }
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Midad.inkFaint)
                }
                .padding(.horizontal, Midad.space4)
                .padding(.vertical, Midad.space2)
                .frame(minHeight: Midad.tapTarget)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityElement(children: .combine)
        }
    }
}

#if DEBUG
#Preview("VerbResultsSection · matches, none", traits: .sizeThatFitsLayout) {
    VStack(spacing: Midad.space4) {
        VerbResultsSection(model: .preview(search: "triumph"))
        VerbResultsSection(model: .preview(search: "zzzz"))
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
#endif
