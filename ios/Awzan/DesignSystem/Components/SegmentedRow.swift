// One-of-N, where the set is fixed and comparing its members is the point.
//
// Used by: Tables' tense / voice / iʿrāb rows (D2), Practice's quiz length
// later. A set whose membership is itself information is `Chip` instead.
//
// WHY THIS IS NOT `Picker(.segmented)`, which is what the design's component
// README says. Two requirements the system control cannot meet, both from
// product-spec/screens/04-tables.md:
//
//   · **One segment disabled, with a reason.** خَرَجَ is intransitive, so it has
//     no majhūl, and D-46 says gaps are shown as gaps: the majhūl segment is
//     disabled and a hint says why. `Picker` disables as a whole or not at all.
//   · **Bilingual labels in fixed slots** — `Past مَاضٍ`. A `Picker` segment takes
//     one `Text`, and one mixed inline run is exactly what D-62 forbids.
//
// Everything else follows `bundle.css` `.sq-seg`, so it reads as the platform
// control it is standing in for.

import SwiftUI

/// One option in a segmented row.
///
/// `disabledReason` is the interesting field. A disabled segment with no reason
/// is the screen silently declining, which is the behaviour the Tables spec
/// singles out as wrong — the caller must say why, and the screen prints it.
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

/// A fixed set of values, one selected.
///
/// The selection is a `Binding` rather than a callback — unlike `Chip` — because
/// one-of-N has exactly one owner and no partial state to coordinate.
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
        // LTR on the track: the segments are an English-ordered sequence
        // (māḍī → muḍāriʿ → amr) even though each label carries Arabic, and each
        // label isolates its own runs.
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

/// The line under a segmented row that says why a segment is unavailable.
///
/// Its own view because the rule it serves is a rule about the SCREEN, not the
/// control: "nothing is silently swapped" only holds if the reason is printed
/// somewhere, and pairing it with the row makes forgetting it visible.
public struct SegmentHint: View {
    private let text: String?

    public init(_ text: String?) { self.text = text }

    public var body: some View {
        if let text {
            // The hint is an English sentence that usually OPENS with an
            // Arabic word (the citation), which is the one shape that flips a
            // whole line right to left. The caller isolates the Arabic run; this
            // pins the sentence's own direction so a caller that forgets does
            // not produce a backwards line.
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
