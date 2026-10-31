// The three pickers that choose the chart: tense, voice and iʿrāb.

import SwiftUI

/// Tense is always there. Voice is hidden for the command (with a line saying
/// why), and iʿrāb shows only for the present. Majhūl is switched off, with the
/// reason under the row, for a verb that has no passive.
///
/// Used by: the Tables screen, while a verb is shown.
struct ChartPickersSection: View {
    let model: TablesModel

    var body: some View {
        VStack(alignment: .leading, spacing: Midad.space3) {
            group("Tense") {
                SegmentedRow(TablesSegments.tense, selection: binding(\.tense, model.select(tense:)))
            }
            if model.showsVoice {
                group("Voice") {
                    SegmentedRow(TablesSegments.voice(gap: model.majhulGap), selection: binding(\.voice, model.select(voice:)))
                    SegmentHint(model.majhulGap?.sentence)
                }
            } else {
                SegmentHint(TablesCopy.commandHasNoVoiceOrMood)
            }
            if model.showsMood {
                group("Iʿrāb") {
                    SegmentedRow(TablesSegments.mood, selection: binding(\.mood, model.select(mood:)))
                }
            }
        }
    }

    private func group<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: Midad.space1) {
            SectionLabel(label)
            content()
        }
    }

    /// A picker reads the model and writes through its `select` method.
    private func binding<Value>(_ read: KeyPath<TablesModel, Value>, _ write: @escaping (Value) -> Void) -> Binding<Value> {
        Binding(get: { model[keyPath: read] }, set: write)
    }
}

#if DEBUG
#Preview("ChartPickersSection · past, present, command, intransitive", traits: .sizeThatFitsLayout) {
    VStack(spacing: Midad.space6) {
        ChartPickersSection(model: .preview(showing: "كتب"))
        ChartPickersSection(model: .preview(showing: "كتب", tense: .mudari, voice: .majhul, mood: .nasb))
        ChartPickersSection(model: .preview(showing: "كتب", tense: .amr))
        ChartPickersSection(model: .preview(showing: "خرج"))
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
#endif
