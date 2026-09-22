// The bilingual chip — the control a set of values is offered in when the set's
// membership is itself the information.
//
// A fixed set meant to be compared is a segmented control (three tenses). A set
// whose membership is a fact — كَتَبَ has seven forms and no V, VII or IX — is
// chips, all visible, gaps included (product-spec design-system rule 5).
//
// Used by: Tables' form chips (numeral + wazn), and later Practice's verb-type,
// tense, voice, iʿrāb and form rows, and the parse card's answer rows. D2 builds
// only the CONFIGURATOR role; the answer role adds a tick box and the six
// AnswerOption states and arrives with Q3.

import SwiftUI

/// What a chip says, in fixed slots.
///
/// Three optional slots rather than one string, because a bilingual label must
/// never be one mixed inline run (🔒 D-62): `VIII اِفْتَعَلَ` set as a single
/// string reorders, and the numeral ends up on the wrong side of the wazn. Each
/// slot is isolated on its own.
///
/// The slots mirror the design's own three spans (`bundle.css` `.sq-chip__num`
/// / `__en` / `__ar`) rather than generalising them, so a chip in the app and a
/// chip in the stylesheet can be read against each other.
public struct ChipLabel: Equatable, Sendable {
    /// The form numeral — `I`, `VIII`. Tabular, so a column of chips lines up.
    public let numeral: String?
    /// The English half: `Hollow`, `Past`.
    public let english: String?
    /// The Arabic half: the wazn `فَعَّلَ`, the term `مَاضٍ`.
    public let arabic: String?

    public init(numeral: String? = nil, english: String? = nil, arabic: String? = nil) {
        self.numeral = numeral
        self.english = english
        self.arabic = arabic
    }
}

/// One chip. Selection is a binding-free callback because the owner of a chip
/// set is always the thing that owns the selection — a chip never holds it.
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
        // A chip set is read as a set, so each chip announces its own state
        // rather than relying on the visual fill.
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }

    // `select` fills a chosen chip, not `sign`: containers carry selection and
    // correctness, letters carry grammar, and the two channels never cross.
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
            // Disabled is a DASHED border plus ink-faint, never an opacity. An
            // opacity says "this is dimmed"; a dashed edge says "this one is
            // not available", which is the fact the screen is reporting.
            shape.strokeBorder(Midad.lineStrong, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
        } else {
            shape.strokeBorder(isSelected ? Midad.select : Midad.lineStrong, lineWidth: 1)
        }
    }
}

// MARK: - Previews

#Preview("Chips · form set", traits: .sizeThatFitsLayout) {
    // كَتَبَ's real form set: I, II, III, IV, VI, VIII, X. V, VII and IX are
    // absent because the verb does not carry them — the gap is the point.
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
