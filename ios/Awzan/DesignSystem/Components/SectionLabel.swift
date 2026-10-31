// The small muted label above a group of controls ("Form", "Tense", "Voice").
//
// Used by: Tables' pickers; later Practice's setup sections.

import SwiftUI

public struct SectionLabel: View {
    private let text: String

    public init(_ text: String) { self.text = text }

    public var body: some View {
        Text(text.bidiIsolated)
            .typeStyle(.label)
            .foregroundStyle(Midad.inkMuted)
            .frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityAddTraits(.isHeader)
    }
}

#Preview("SectionLabel", traits: .sizeThatFitsLayout) {
    VStack(spacing: Midad.space2) {
        SectionLabel("Form")
        SectionLabel("Iʿrāb")
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
