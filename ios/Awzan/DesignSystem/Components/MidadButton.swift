// The three button styles. Use one primary button per screen.
//
// Used by: Tables' "View the table" button, and later every screen. The label
// text is written where the button is used.

import SwiftUI

public extension ButtonStyle where Self == MidadButtonStyle {
    /// The screen's main action, filled with the `action` colour (ink).
    static var midadPrimary: MidadButtonStyle { MidadButtonStyle(kind: .primary) }

    /// A second action: outlined, with the same height as the primary.
    static var midadSecondary: MidadButtonStyle { MidadButtonStyle(kind: .secondary) }

    /// No box, for a minor action.
    static var midadQuiet: MidadButtonStyle { MidadButtonStyle(kind: .quiet) }
}

public struct MidadButtonStyle: ButtonStyle {
    public enum Kind { case primary, secondary, quiet }

    let kind: Kind
    /// A ButtonStyle can't see whether its button is disabled, so read it from the
    /// environment.
    @Environment(\.isEnabled) private var isEnabled

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .typeStyle(.headline)
            .padding(.horizontal, Midad.space5)
            .frame(minHeight: minHeight)
            .frame(maxWidth: kind == .quiet ? nil : .infinity)
            .foregroundStyle(foreground)
            .background(background)
            .overlay(border)
            .clipShape(RoundedRectangle(cornerRadius: Midad.radiusMd, style: .continuous))
            // Pressing moves the button down 1pt, quickly.
            .offset(y: configuration.isPressed ? 1 : 0)
            .animation(.easeOut(duration: 0.08), value: configuration.isPressed)
    }

    private var minHeight: CGFloat {
        kind == .primary ? 52 : Midad.tapTarget
    }

    private var foreground: Color {
        switch (kind, isEnabled) {
        case (_, false) where kind == .primary: Midad.inkMuted
        case (_, false): Midad.inkFaint
        case (.primary, true): Midad.onAction
        case (.quiet, true): Midad.inkMuted
        case (.secondary, true): Midad.ink
        }
    }

    private var background: Color {
        switch (kind, isEnabled) {
        case (.primary, true): Midad.action
        // A disabled primary keeps its shape but loses its fill.
        case (.primary, false): Midad.fill
        case (.secondary, true): Midad.raised
        default: .clear
        }
    }

    @ViewBuilder private var border: some View {
        let shape = RoundedRectangle(cornerRadius: Midad.radiusMd, style: .continuous)
        switch (kind, isEnabled) {
        case (.quiet, _):
            EmptyView()
        case (.primary, true):
            shape.strokeBorder(Midad.action, lineWidth: 1)
        case (.primary, false):
            shape.strokeBorder(Midad.fill, lineWidth: 1)
        case (.secondary, true):
            shape.strokeBorder(Midad.lineStrong, lineWidth: 1)
        case (.secondary, false):
            // A dashed border (not a faded button) reads as "not available".
            shape.strokeBorder(Midad.lineStrong, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
        }
    }
}

#Preview("Buttons", traits: .sizeThatFitsLayout) {
    VStack(spacing: Midad.space3) {
        Button("View the table") {}.buttonStyle(.midadPrimary)
        Button("View the table") {}.buttonStyle(.midadPrimary).disabled(true)
        Button("Compare charts") {}.buttonStyle(.midadSecondary)
        Button("Compare charts") {}.buttonStyle(.midadSecondary).disabled(true)
        Button("Skip") {}.buttonStyle(.midadQuiet)
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
