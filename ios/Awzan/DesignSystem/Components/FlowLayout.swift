// A wrapping row. Written once, used by every set of chips.
//
// Why a Layout and not an HStack: a chip set's MEMBERSHIP is the information
// (product-spec design-system rule 5 — كَتَبَ has seven forms and no V, VII or
// IX, and the gaps are a fact about the verb). So every chip must be visible,
// which means wrapping onto further lines, which `HStack` cannot do and
// `LazyVGrid` cannot do at content width — a grid gives equal columns, and
// "I فَعَلَ" beside "VIII اِفْتَعَلَ" would then be padded to the same width and
// stop reading as a row of words.
//
// Used by: Tables' form chips (D2), Practice's verb-type / tense / form chips
// and the parse card's axis rows (both later).

import SwiftUI

/// Lays subviews left to right, wrapping when the line is full.
///
/// Alignment is deliberately absent: chips are read as a set, and centring or
/// justifying a wrapped set makes the last line float away from the edge the
/// eye is scanning down.
public struct FlowLayout: Layout {
    public var spacing: CGFloat
    public var lineSpacing: CGFloat

    public init(spacing: CGFloat = Midad.space2, lineSpacing: CGFloat = Midad.space2) {
        self.spacing = spacing
        self.lineSpacing = lineSpacing
    }

    public func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = rows(width: proposal.width ?? .infinity, subviews: subviews)
        let height = rows.reduce(0) { $0 + $1.height } + lineSpacing * CGFloat(max(0, rows.count - 1))
        let width = rows.map(\.width).max() ?? 0
        return CGSize(width: min(width, proposal.width ?? width), height: height)
    }

    public func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in rows(width: bounds.width, subviews: subviews) {
            var x = bounds.minX
            for index in row.indices {
                let size = subviews[index].sizeThatFits(.unspecified)
                subviews[index].place(
                    at: CGPoint(x: x, y: y + (row.height - size.height) / 2),
                    proposal: ProposedViewSize(size)
                )
                x += size.width + spacing
            }
            y += row.height + lineSpacing
        }
    }

    private struct Row {
        var indices: [Int] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func rows(width limit: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = []
        var row = Row()
        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            let needed = row.indices.isEmpty ? size.width : row.width + spacing + size.width
            // A single subview wider than the line still gets its own row rather
            // than being dropped: a chip that does not fit is a layout problem to
            // see, not one to hide.
            if needed > limit, !row.indices.isEmpty {
                rows.append(row)
                row = Row()
            }
            row.width = row.indices.isEmpty ? size.width : row.width + spacing + size.width
            row.height = max(row.height, size.height)
            row.indices.append(index)
        }
        if !row.indices.isEmpty { rows.append(row) }
        return rows
    }
}
