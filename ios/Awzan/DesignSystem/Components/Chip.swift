// The chip: a button for choosing from a set where every option should stay
// visible, including the ones that aren't available.
//
// Used by: Tables' form chips; later Practice's filters and the parse card's
// answer rows.

import SwiftUI

/// What a chip says: a form numeral, an English word and an Arabic word, all
/// optional. They are kept as separate parts so each can be isolated from the
/// others (see BidiText).
public struct ChipLabel: Equatable, Sendable {
    /// The form numeral: `I`, `VIII`.
    public let numeral: String?
    /// The English word: `Hollow`, `Past`.
    public let english: String?
    /// The Arabic word: `فَعَّلَ`, `مَاضٍ`.
    public let arabic: String?

    public init(numeral: String? = nil, english: String? = nil, arabic: String? = nil) {
        self.numeral = numeral
        self.english = english
        self.arabic = arabic
    }
}

/// One chip. It only reports taps; whoever owns the set holds the selection.
public struct Chip: View {
    private let label: ChipLabel
    private let isSelected: Bool
    private let isEnabled: Bool
    private let action: () -> Void

    public init(
        _ label: ChipLabel,
        isSelected: Bool,
        isEnabled: Bool = true,
        action: @escaping () -> Void
    ) {
        self.label = label
        self.isSelected = isSelected
        self.isEnabled = isEnabled
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: Midad.space2) {
                if let numeral = label.numeral {
                    Text(numeral.bidiIsolated)
                        .typeStyle(.label)
                        .monospacedDigit()
                }
                if let english = label.english {
                    Text(english.bidiIsolated)
                        .typeStyle(.label)
                }
                if let arabic = label.arabic {
                    Text(arabic.bidiIsolated)
                        .typeStyle(.arabicLabel)
                        .foregroundStyle(arabicColor)
                }
            }
            .padding(.horizontal, Midad.space3)
            .frame(minHeight: 40)
            .background(background)
            .foregroundStyle(foreground)
            .overlay(border)
            .clipShape(RoundedRectangle(cornerRadius: Midad.radiusSm, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
        // VoiceOver announces whether each chip is selected.
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }

    // A selected chip fills with `select`. (`sign` is only for grammar letters.)
    private var background: Color { isSelected ? Midad.select : Midad.raised }
    private var foreground: Color {
        guard isEnabled else { return Midad.inkFaint }
        return isSelected ? Midad.onSelect : Midad.ink
    }
    private var arabicColor: Color {
        guard isEnabled else { return Midad.inkFaint }
        return isSelected ? Midad.onSelect : Midad.inkMuted
    }

    @ViewBuilder private var border: some View {
        let shape = RoundedRectangle(cornerRadius: Midad.radiusSm, style: .continuous)
        if !isEnabled {
            // A dashed border (not a faded chip) reads as "not available".
            shape.strokeBorder(Midad.lineStrong, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
        } else {
            shape.strokeBorder(isSelected ? Midad.select : Midad.lineStrong, lineWidth: 1)
        }
    }
}

// MARK: - Previews

#Preview("Chips · form set", traits: .sizeThatFitsLayout) {
    // كَتَبَ has forms I, II, III, IV, VI, VIII and X. IX is shown disabled.
    FlowLayout {
        Chip(ChipLabel(numeral: "I", arabic: "فَعَلَ"), isSelected: true) {}
        Chip(ChipLabel(numeral: "II", arabic: "فَعَّلَ"), isSelected: false) {}
        Chip(ChipLabel(numeral: "III", arabic: "فَاعَلَ"), isSelected: false) {}
        Chip(ChipLabel(numeral: "IV", arabic: "أَفْعَلَ"), isSelected: false) {}
        Chip(ChipLabel(numeral: "VI", arabic: "تَفَاعَلَ"), isSelected: false) {}
        Chip(ChipLabel(numeral: "VIII", arabic: "اِفْتَعَلَ"), isSelected: false) {}
        Chip(ChipLabel(numeral: "IX", arabic: "اِفْعَلَّ"), isSelected: false, isEnabled: false) {}
        Chip(ChipLabel(english: "Hollow", arabic: "أَجْوَف"), isSelected: false) {}
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
