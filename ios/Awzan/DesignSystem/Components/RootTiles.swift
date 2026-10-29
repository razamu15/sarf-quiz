// A root shown as three separate letter tiles, with the first letter on the right.
//
// The letters are separate tiles, not a joined word, because a root isn't a word.
//
// Used by: Tables' search rows and header; later the quiz and meaning cards.

import SwiftUI

/// The tile sizes. The letter size is fixed to the tile, not taken from the type
/// scale.
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

/// A root's letters, drawn right to left.
public struct RootTiles: View {
    private let radicals: [String]
    private let size: RootTileSize
    private let showsSlots: Bool

    /// - Parameters:
    ///   - radicals: the letters in root order, e.g. `["ن", "ص", "ر"]`. The first
    ///     is the rightmost tile.
    ///   - showsSlots: show ف ع ل under the tiles, marking which letter fills
    ///     which place of the pattern. Show it the first time a root appears on a
    ///     screen.
    public init(_ radicals: [String], size: RootTileSize = .medium, showsSlots: Bool = false) {
        self.radicals = radicals
        self.size = size
        self.showsSlots = showsSlots
    }

    /// The pattern letters (ف ع ل), in the same order as the tiles above them.
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
        .environment(\.layoutDirection, .rightToLeft)
        // VoiceOver reads the root as one item.
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text("Root \(radicals.joined(separator: " "))"))
    }

    private func tile(_ letter: String) -> some View {
        Text(letter)
            // A fixed font size, so a larger text size can't push the letter out of
            // its tile.
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
