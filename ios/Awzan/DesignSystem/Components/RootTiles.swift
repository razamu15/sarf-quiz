// The three radicals, as three separate type sorts, first radical on the RIGHT.
//
// A root is not a word — it is three letters that a pattern is poured into — so
// it is set as three sorts with air between them rather than as a joined string.
// Joining كتب would make it look like a word it is not.
//
// Used by: Tables' search rows and the table header (D2); later the quiz cue
// card and the meaning card.

import SwiftUI

/// How large the tiles are drawn.
///
/// The glyph size lives here rather than in the type scale on purpose: a tile is
/// a fixed-size sort and its letter is sized to the sort, the way a piece of
/// type is. It is geometry, not a voice — which is why `arabic-display` is not
/// the right answer even though 40pt is close to `.large`'s 42.
public enum RootTileSize {
    case small, medium, large

    var side: CGSize {
        switch self {
        case .small: CGSize(width: 30, height: 34)
        case .medium: CGSize(width: 52, height: 58)
        case .large: CGSize(width: 64, height: 72)
        }
    }

    var glyph: CGFloat {
        switch self {
        case .small: 20
        case .medium: 34
        case .large: 42
        }
    }

    var radius: CGFloat {
        switch self {
        case .small: 5
        case .medium, .large: Midad.radiusXs
        }
    }

    var gap: CGFloat {
        switch self {
        case .small: 4
        case .medium, .large: Midad.space2
        }
    }

    var raised: Bool {
        switch self {
        case .small: false
        case .medium, .large: true
        }
    }
}

/// A root's radicals, right to left.
public struct RootTiles: View {
    private let radicals: [String]
    private let size: RootTileSize
    private let showsSlots: Bool

    /// - Parameters:
    ///   - radicals: in root order — `["ن", "ص", "ر"]`. Drawn right to left, so
    ///     the first radical is the rightmost tile.
    ///   - showsSlots: print ف ع ل under the tiles — the mīzān, which radical
    ///     fills which place of the pattern. The design shows these **the first
    ///     time a root appears on a screen** and not again.
    public init(_ radicals: [String], size: RootTileSize = .medium, showsSlots: Bool = false) {
        self.radicals = radicals
        self.size = size
        self.showsSlots = showsSlots
    }

    /// The mīzān letters, in the same order as the radicals they sit under.
    private static let slots = ["ف", "ع", "ل"]

    public var body: some View {
        HStack(spacing: size.gap) {
            ForEach(Array(radicals.enumerated()), id: \.offset) { index, letter in
                VStack(spacing: 6) {
                    tile(letter)
                    if showsSlots {
                        Text(Self.slots.indices.contains(index) ? Self.slots[index] : "")
                            .font(.custom("ScheherazadeNew-Regular", fixedSize: 17))
                            .foregroundStyle(Midad.inkMuted)
                    }
                }
            }
        }
        // The tiles run right to left; each letter is isolated inside its own
        // tile, so no surrounding English can reorder them.
        .environment(\.layoutDirection, .rightToLeft)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text("Root \(radicals.joined(separator: " "))"))
    }

    private func tile(_ letter: String) -> some View {
        Text(letter)
            // Fixed size, not `.typeStyle`: the glyph is sized to the tile, and
            // Dynamic Type growing the letter past a fixed 52×58 box would clip
            // it. The row of tiles is decorative structure around text that is
            // announced to VoiceOver as one root.
            .font(.custom("ScheherazadeNew-Regular", fixedSize: size.glyph))
            .foregroundStyle(Midad.ink)
            .frame(width: size.side.width, height: size.side.height)
            .background(Midad.raised)
            .overlay(
                RoundedRectangle(cornerRadius: size.radius, style: .continuous)
                    .strokeBorder(Midad.lineStrong, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: size.radius, style: .continuous))
            .shadow(color: size.raised ? Midad.ink.opacity(0.06) : .clear, radius: 1, y: 1)
    }
}

#Preview("RootTiles · three sizes", traits: .sizeThatFitsLayout) {
    VStack(alignment: .leading, spacing: Midad.space8) {
        RootTiles(["ن", "ص", "ر"], size: .small)
        RootTiles(["ك", "ت", "ب"], size: .medium)
        RootTiles(["ق", "و", "ل"], size: .large, showsSlots: true)
    }
    .padding(Midad.space6)
    .background(Midad.ground)
}
