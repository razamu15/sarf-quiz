// A chip for every form the chosen verb has.

import SwiftUI

/// The numeral and the pattern of each form, with the chosen form selected.
/// Forms the verb lacks have no chip, so the gaps show.
///
/// Used by: the Tables screen, while a verb is shown.
struct FormChipsSection: View {
    let model: TablesModel

    var body: some View {
        VStack(alignment: .leading, spacing: Midad.space1) {
            SectionLabel("Form")
            FlowLayout {
                ForEach(model.forms) { option in
                    Chip(
                        ChipLabel(numeral: option.form.rawValue, arabic: option.wazn),
                        isSelected: option.form == model.chosen?.form
                    ) {
                        model.select(form: option.form)
                    }
                }
            }
        }
    }
}

#if DEBUG
#Preview("FormChipsSection · كتب, حمر", traits: .sizeThatFitsLayout) {
    VStack(spacing: Midad.space4) {
        FormChipsSection(model: .preview(showing: "كتب", form: .ii))
        FormChipsSection(model: .preview(showing: "حمر", form: .ix))
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
#endif
