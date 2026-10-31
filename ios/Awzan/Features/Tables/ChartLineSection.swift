// The line that names the chart, and the button that opens it.

import SwiftUI

/// Names the chart the pickers ask for and how many words it has, with "View the
/// table" under it. If the engine has no such chart, a sentence says so instead
/// and there is no button. Once the table is open the button goes, and the screen
/// draws the table below.
///
/// Used by: the Tables screen, while a verb is shown.
struct ChartLineSection: View {
    let model: TablesModel

    var body: some View {
        switch model.chart {
        case nil:
            EmptyView()
        case .missing?:
            Text(TablesCopy.noChart)
                .typeStyle(.caption)
                .foregroundStyle(Midad.inkMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
        case .waiting(let line)?:
            VStack(spacing: Midad.space3) {
                header(line)
                Button("View the table") { model.viewTable() }
                    .buttonStyle(.midadPrimary)
            }
        case .open(let line, _)?:
            header(line)
        }
    }

    private func header(_ line: TablesModel.ChartLine) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(line.title)
                .typeStyle(.label)
                .foregroundStyle(Midad.inkMuted)
            Spacer(minLength: Midad.space3)
            Text(line.countText)
                .typeStyle(.caption)
                .foregroundStyle(Midad.inkMuted)
        }
    }
}

#if DEBUG
#Preview("ChartLineSection · waiting, command, open, no chart", traits: .sizeThatFitsLayout) {
    VStack(spacing: Midad.space6) {
        ChartLineSection(model: .preview(showing: "كتب"))
        ChartLineSection(model: .preview(showing: "كتب", tense: .amr))
        ChartLineSection(model: .preview(showing: "كتب", tableOpen: true))
        ChartLineSection(model: .preview(showing: "حمر", form: .ix))
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
#endif
