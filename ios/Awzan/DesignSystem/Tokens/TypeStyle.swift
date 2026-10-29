// Turns an entry of the type scale into a real font with a fixed line height.
//
// The scale itself (sizes and line heights) is generated in MidadType.swift. This
// file is the logic: finding the bundled font, setting a variable font's weight,
// and applying the line height.
//
// Used by: every view, through `.typeStyle(.arabicTitle)` and the like. Use that
// instead of `.font(...)`.

import SwiftUI

// MARK: - The three faces

/// The three typefaces.
public enum Face: Sendable {
    /// Scheherazade New, for Arabic. Regular weight only: bold would break the
    /// joins between letters.
    case arabic
    /// Newsreader, for meanings. It is a variable font, so its weight is set on
    /// the font's `wght` axis.
    case serif
    /// The system font, for the interface.
    case sans
}

// MARK: - A style

/// One entry of the type scale: a size, a line height and a weight.
///
/// The line height is explicit because vowelled Arabic is taller than a font's
/// normal line, and the font's own spacing would let the vowel marks touch the
/// line above.
public struct TypeStyle: Sendable, Equatable {
    public let face: Face
    /// Point size at the default text size.
    public let size: CGFloat
    /// Height of one line at the default text size.
    public let lineHeight: CGFloat
    /// CSS-style weight (400, 500, 600, 700). Only serif and sans use it.
    public let weight: Int
    public let italic: Bool
    /// Letter spacing, in em.
    public let tracking: CGFloat
    /// The Dynamic Type category this style scales with.
    public let ramp: Font.TextStyle
    /// Fixed-width digits, so a number doesn't shift as it changes.
    public let tabularFigures: Bool

    public init(
        face: Face,
        size: CGFloat,
        lineHeight: CGFloat,
        weight: Int,
        italic: Bool,
        tracking: CGFloat,
        ramp: Font.TextStyle,
        tabularFigures: Bool = false
    ) {
        self.face = face
        self.size = size
        self.lineHeight = lineHeight
        self.weight = weight
        self.italic = italic
        self.tracking = tracking
        self.ramp = ramp
        self.tabularFigures = tabularFigures
    }
}

// MARK: - Resolving a face to a font

extension TypeStyle {
    /// The font names `UIFont(name:)` needs. The family names (such as
    /// "Newsreader 16pt") don't work: the text silently falls back to Helvetica.
    fileprivate var postScriptName: String? {
        switch face {
        case .arabic: "ScheherazadeNew-Regular"
        case .serif: italic ? "Newsreader16pt-Italic" : "Newsreader16pt-Regular"
        case .sans: nil
        }
    }

    /// The font for this style at a given point size.
    ///
    /// Newsreader's weight is set on its font axis, because SwiftUI's
    /// `.fontWeight` isn't reliable for custom fonts.
    fileprivate func uiFont(at scaledSize: CGFloat) -> UIFont {
        guard let name = postScriptName else {
            let w = UIFont.Weight(cssWeight: weight)
            let base = tabularFigures
                ? UIFont.monospacedDigitSystemFont(ofSize: scaledSize, weight: w)
                : UIFont.systemFont(ofSize: scaledSize, weight: w)
            guard italic,
                  let d = base.fontDescriptor.withSymbolicTraits(.traitItalic)
            else { return base }
            return UIFont(descriptor: d, size: scaledSize)
        }

        var descriptor = UIFontDescriptor(name: name, size: scaledSize)
        if face == .serif {
            descriptor = descriptor.addingAttributes([
                .init(rawValue: kCTFontVariationAttribute as String): [Self.weightAxis: weight],
            ])
        }
        return UIFont(descriptor: descriptor, size: scaledSize)
    }

    /// The font's weight axis ('wght'), as the number CoreText expects.
    private static let weightAxis: UInt32 = 0x7767_6874 // 'wght'
}

private extension UIFont.Weight {
    init(cssWeight: Int) {
        self = switch cssWeight {
        case ..<350: .light
        case ..<450: .regular
        case ..<550: .medium
        case ..<650: .semibold
        case ..<750: .bold
        default: .heavy
        }
    }
}

// MARK: - Applying a style

public extension View {
    /// Sets the font and the line height. Use this instead of `.font(...)`.
    func typeStyle(_ style: TypeStyle) -> some View {
        modifier(TypeStyleModifier(style))
    }
}

private struct TypeStyleModifier: ViewModifier {
    private let style: TypeStyle
    @ScaledMetric private var size: CGFloat
    @ScaledMetric private var lineHeight: CGFloat

    init(_ style: TypeStyle) {
        self.style = style
        // ScaledMetric makes both values follow Dynamic Type, including when a
        // preview overrides the text size.
        _size = ScaledMetric(wrappedValue: style.size, relativeTo: style.ramp)
        _lineHeight = ScaledMetric(wrappedValue: style.lineHeight, relativeTo: style.ramp)
    }

    func body(content: Content) -> some View {
        let font = style.uiFont(at: size)
        // The extra space needed to reach the design's line height. Never
        // negative: at the largest text sizes the font's own line can be taller.
        let leading = max(0, lineHeight - font.lineHeight)
        return content
            .font(Font(font))
            // Half the extra above and half below, so a single line is also the
            // full height (lineSpacing alone only adds space between lines).
            .lineSpacing(leading)
            .padding(.vertical, leading / 2)
            .tracking(style.tracking * size)
    }
}

// MARK: - Registering the bundled fonts

public enum MidadFonts {
    /// The bundled fonts: PostScript name, and the file it should come from.
    ///
    /// Used by: AwzanApp. `UIAppFonts` in Info.plist registers the fonts; this is
    /// only used to check that they loaded.
    static let bundled = [
        "ScheherazadeNew-Regular": "ScheherazadeNew-Regular.ttf",
        "Newsreader16pt-Regular": "Newsreader.ttf",
        "Newsreader16pt-Italic": "Newsreader-Italic.ttf",
    ]

    /// The fonts that failed to load. Empty is good.
    public static func missing() -> [String] {
        bundled.keys.filter { UIFont(name: $0, size: 12) == nil }.sorted()
    }
}
