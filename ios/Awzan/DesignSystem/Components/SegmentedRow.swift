// A row of segments where exactly one is selected, for choosing between a few
// fixed options (tense, voice, mood).
//
// This replaces `Picker(.segmented)`, which can't disable a single segment (with
// a reason) or show an English and an Arabic label together.
//
// Used by: Tables' tense, voice and mood rows; later Practice's quiz length.

import SwiftUI

/// One option in a segmented row.
///
/// If `disabledReason` is set, the segment is disabled and the reason is shown
/// to the user (see `SegmentHint`).
public struct Segment<Value: Hashable>: Identifiable {
    public let value: Value
    public let english: String
    public let arabic: String?
    public let disabledReason: String?

    public var id: Value { value }
    public var isEnabled: Bool { disabledReason == nil }

    public init(_ value: Value, english: String, arabic: String? = nil, disabledReason: String? = nil) {
        self.value = value
        self.english = english
        self.arabic = arabic
        self.disabledReason = disabledReason
    }
}

/// A fixed set of values with one selected. The selection is a `Binding`, since
/// the screen owns the one selected value.
public struct SegmentedRow<Value: Hashable>: View {
    private let segments: [Segment<Value>]
    @Binding private var selection: Value

    public init(_ segments: [Segment<Value>], selection: Binding<Value>) {
        self.segments = segments
        self._selection = selection
    }

    public var body: some View {
        HStack(spacing: 2) {
            ForEach(segments) { segment in
                Button { selection = segment.value } label: {
                    HStack(spacing: 6) {
                        Text(segment.english.bidiIsolated)
                            .typeStyle(.label)
                        if let arabic = segment.arabic {
                            Text(arabic.bidiIsolated)
                                .typeStyle(.arabicLabel)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: 38)
                    .background(fill(for: segment))
                    .foregroundStyle(foreground(for: segment))
                    .overlay(border(for: segment))
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                .buttonStyle(.plain)
                .disabled(!segment.isEnabled)
                .accessibilityAddTraits(segment.value == selection ? [.isButton, .isSelected] : .isButton)
                .accessibilityHint(segment.disabledReason ?? "")
            }
        }
        .padding(3)
        .background(Midad.fill)
        .clipShape(RoundedRectangle(cornerRadius: Midad.radiusSm, style: .continuous))
        // Segments always run left to right (past, present, command).
        .environment(\.layoutDirection, .leftToRight)
    }

    private func fill(for segment: Segment<Value>) -> Color {
        segment.value == selection ? Midad.raised : .clear
    }

    private func foreground(for segment: Segment<Value>) -> Color {
        if !segment.isEnabled { return Midad.inkFaint }
        return segment.value == selection ? Midad.ink : Midad.inkMuted
    }

    @ViewBuilder private func border(for segment: Segment<Value>) -> some View {
        if segment.value == selection {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .strokeBorder(Midad.lineStrong, lineWidth: 1)
        }
    }
}

/// The line under a segmented row that says why a segment is disabled.
public struct SegmentHint: View {
    private let text: String?

    public init(_ text: String?) { self.text = text }

    public var body: some View {
        if let text {
            // Forced left to right, because the sentence often starts with an
            // Arabic word.
            Text(text.leftToRightLine)
                .typeStyle(.caption)
                .foregroundStyle(Midad.inkMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

#Preview("Segmented · tense and a disabled voice", traits: .sizeThatFitsLayout) {
    @Previewable @State var tense = "madi"
    @Previewable @State var voice = "malum"
    VStack(alignment: .leading, spacing: Midad.space4) {
        SegmentedRow([
            Segment("madi", english: "Past", arabic: "مَاضٍ"),
            Segment("mudari", english: "Present", arabic: "مُضَارِع"),
            Segment("amr", english: "Command", arabic: "أَمْر"),
        ], selection: $tense)

        VStack(alignment: .leading, spacing: Midad.space1) {
            SegmentedRow([
                Segment("malum", english: "Active", arabic: "مَعْرُوف"),
                Segment("majhul", english: "Passive", arabic: "مَجْهُول",
                        disabledReason: "خَرَجَ is intransitive — it has no majhūl."),
            ], selection: $voice)
            SegmentHint("خَرَجَ is intransitive — it has no majhūl.")
        }
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
