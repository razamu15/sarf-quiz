// How a line of the Midād type scale becomes a real font with a real row height.
//
// The SCALE is data and is generated (MidadType.swift, from tokens.json). This
// file is the logic beside it: resolving a face to a bundled font, driving a
// variable font's weight axis, and giving every style the explicit vertical
// room product-spec D-59 requires.
//
// Used by: every view in DesignSystem/Components and Features, through
// `.typeStyle(.arabicTitle)` and friends. Nothing calls `Font.custom` directly.

import SwiftUI

// MARK: - The three faces

/// **Three voices, three faces** (product-spec D-59, rule 4). Arabic is the
/// object of study, the serif is a *meaning*, the sans is the interface talking.
/// Nothing else gets a face, which is why this enum is closed and small.
public enum Face: Sendable {
    /// Scheherazade New, bundled. Regular only — a weight change breaks the
    /// joining inside an Arabic word, so colour is the one safe emphasis.
    case arabic
    /// Newsreader, bundled, as a **variable** font: Google Fonts publishes no
    /// static instances, so a weight is a point on the `wght` axis.
    case serif
    /// The system sans. Not bundled, and deliberately not named: it should be
    /// whatever the platform's interface font is, including future changes.
    case sans
}

// MARK: - A style

/// One line of the type scale: a size, an explicit line height, and which
/// Dynamic Type ramp both of them scale along.
///
/// `lineHeight` is the field that earns this being a struct rather than a
/// `Font`. Vowelled Arabic is taller than a font's nominal line box — a shadda
/// over a ḍamma stacks two marks above the letter — so Scheherazade's own
/// metrics leave يُعَلِّمُ touching the line above at quiz sizes. D-59 settles
/// that by writing the row heights out rather than fighting the metrics, and
/// `.typeStyle(_:)` is what applies them.
public struct TypeStyle: Sendable, Equatable {
    public let face: Face
    /// Points at the default Dynamic Type size.
    public let size: CGFloat
    /// The total height of one line, points, at the default Dynamic Type size.
    public let lineHeight: CGFloat
    /// CSS weight (400, 500, 600, 700). Only `serif` and `sans` honour it.
    public let weight: Int
    public let italic: Bool
    /// Letter spacing in **em**, as the design states it; converted to points
    /// against the scaled size when applied.
    public let tracking: CGFloat
    /// The Dynamic Type ramp this style grows along. A port decision — the web
    /// has no Dynamic Type — declared beside the sizes in MidadType.swift.
    public let ramp: Font.TextStyle
    /// Fixed-width digits, so a changing number does not shift the glyphs
    /// beside it. True for `numeral` alone: the stat tiles and the Results score.
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
    /// PostScript names, read off the bundled files rather than guessed — the
    /// family name ("Newsreader 16pt") is not what `UIFont(name:)` takes, and
    /// the difference fails silently by falling back to Helvetica.
    fileprivate var postScriptName: String? {
        switch face {
        case .arabic: "ScheherazadeNew-Regular"
        case .serif: italic ? "Newsreader16pt-Italic" : "Newsreader16pt-Regular"
        case .sans: nil
        }
    }

    /// The font for this style at an already-scaled point size.
    ///
    /// Newsreader's weight is set through the **variation axis**, not through
    /// `.fontWeight()`. SwiftUI's weight modifier is documented against the
    /// system font and is not guaranteed to move a custom font's axis; when it
    /// does nothing the result is a silent 400 where `screen-title` asked for
    /// 500 — a miss that survives review because it looks fine. Asking CoreText
    /// for the instance makes it either work or fail loudly.
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

    /// The OpenType `wght` axis, as a four-character code. CoreText keys the
    /// variation dictionary by this integer, not by the string.
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
    /// Set the font **and its row height**.
    ///
    /// Both halves matter: `.font()` alone leaves Arabic marks colliding with
    /// the line above, which is the whole of D-59. Use this rather than
    /// `.font(...)` anywhere in the app.
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
        // Scaled through @ScaledMetric rather than UIFontMetrics so both react
        // to the environment's dynamicTypeSize — including a preview or a
        // single view overriding it, which UIApplication's category does not see.
        _size = ScaledMetric(wrappedValue: style.size, relativeTo: style.ramp)
        _lineHeight = ScaledMetric(wrappedValue: style.lineHeight, relativeTo: style.ramp)
    }

    func body(content: Content) -> some View {
        let font = style.uiFont(at: size)
        // What the design's row height adds on top of the font's own line box.
        // Clamped at zero: at the largest Dynamic Type a font's box can outgrow
        // the design's leading, and the right answer there is to let the text
        // set its own height rather than to clip it.
        let leading = max(0, lineHeight - font.lineHeight)
        return content
            .font(Font(font))
            // Half above, half below, so a SINGLE line is exactly `lineHeight`
            // tall — lineSpacing alone only sits between lines and would leave
            // a one-line row short of the row height the design specifies.
            .lineSpacing(leading)
            .padding(.vertical, leading / 2)
            .tracking(style.tracking * size)
    }
}

// MARK: - Registering the bundled fonts

public enum MidadFonts {
    /// Every bundled face, by PostScript name, paired with the file that should
    /// have supplied it.
    ///
    /// Called by `AwzanApp.init`. `UIAppFonts` in Info.plist is what actually
    /// registers them; this only *checks*, because a missing custom font does
    /// not throw — `UIFont(name:)` returns a system fallback and the app renders
    /// in Helvetica, which reads as a styling bug rather than a missing file.
    static let bundled = [
        "ScheherazadeNew-Regular": "ScheherazadeNew-Regular.ttf",
        "Newsreader16pt-Regular": "Newsreader.ttf",
        "Newsreader16pt-Italic": "Newsreader-Italic.ttf",
    ]

    /// PostScript names the bundle did not supply. Empty is the only good answer.
    public static func missing() -> [String] {
        bundled.keys.filter { UIFont(name: $0, size: 12) == nil }.sorted()
    }
}
