// The button styles. One primary per screen.
//
// Used by: Tables' *View the table* (D2), and every screen after it.
//
// Labels are sentence case, verb first, count after a middle dot — "View the
// table", "Start · 10 questions". That is copy, so it lives at the call site;
// what lives here is the shape.

import SwiftUI

public extension ButtonStyle where Self == MidadButtonStyle {
    /// **The one primary action on a screen.** Filled with `action`, which is
    /// ink — the design has no coloured call-to-action, because the only accent
    /// it owns is reserved for letters that carry grammar.
    static var midadPrimary: MidadButtonStyle { MidadButtonStyle(kind: .primary) }

    /// A secondary action: outlined, same height, same weight of voice.
    static var midadSecondary: MidadButtonStyle { MidadButtonStyle(kind: .secondary) }

    /// No box at all — for a tertiary action that should not compete.
    static var midadQuiet: MidadButtonStyle { MidadButtonStyle(kind: .quiet) }
}

public struct MidadButtonStyle: ButtonStyle {
    public enum Kind { case primary, secondary, quiet }

    let kind: Kind
    /// `isEnabled` has to be read from the environment rather than passed in:
    /// `ButtonStyle` sees `configuration.isPressed` but not the disabled state,
    /// and a disabled primary that still looks filled is the worst of both.
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
            // 80ms, and it does not bounce. Reduced motion drops the transition
            // rather than substituting another one (D-65).
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
        // A disabled primary keeps its box and loses its fill — the button is
        // still the shape of the screen's one action, it just cannot be taken.
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
            // Disabled is a dashed border and ink-faint, NOT an opacity: dimming
            // says "de-emphasised", a dashed edge says "not available".
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
