// The bar at the top of Tables. It is either a search field, or shows the chosen
// verb.
//
// Used by: the Tables screen.

import SwiftUI

/// What the bar shows: searching, or a chosen verb. Never both at once.
public enum WordBarState: Equatable {
    /// Typing a search. Carries the current text.
    case searching(query: String)
    /// A verb is chosen. Shows the citation and meaning of the root in the chosen
    /// form (Form VIII of نصر shows اِنْتَصَرَ, "to triumph").
    case chosen(citation: String, gloss: String)
}

public struct WordBar: View {
    @Binding private var state: WordBarState
    /// Called by the ✕ while searching, to go back to the chosen verb. Nil if
    /// there is nothing to go back to.
    private let onCancelSearch: (() -> Void)?
    @FocusState private var isFocused: Bool

    public init(state: Binding<WordBarState>, onCancelSearch: (() -> Void)? = nil) {
        self._state = state
        self.onCancelSearch = onCancelSearch
    }

    public var body: some View {
        HStack(spacing: Midad.space2) {
            switch state {
            case .searching(let query):
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Midad.inkMuted)
                    .frame(width: 20, height: 20)
                TextField(
                    "",
                    text: Binding(
                        get: { query },
                        set: { state = .searching(query: $0) }
                    ),
                    prompt: Text("Root letters or meaning").foregroundStyle(Midad.inkMuted)
                )
                .typeStyle(.body)
                .foregroundStyle(Midad.ink)
                .focused($isFocused)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                clearButton { onCancelSearch?() }

            case .chosen(let citation, let gloss):
                Button {
                    state = .searching(query: "")
                } label: {
                    HStack(alignment: .firstTextBaseline, spacing: Midad.space2) {
                        Text(citation.bidiIsolated)
                            .typeStyle(.arabicTitle)
                            .foregroundStyle(Midad.ink)
                            .lineLimit(1)
                            // The Arabic keeps its space; the meaning gets cut
                            // off first.
                            .layoutPriority(1)
                        Text(gloss.bidiIsolated)
                            .typeStyle(.gloss)
                            .foregroundStyle(Midad.inkMuted)
                            .lineLimit(1)
                            .truncationMode(.tail)
                        Spacer(minLength: 0)
                    }
                }
                .buttonStyle(.plain)
                clearButton { state = .searching(query: "") }
            }
        }
        .padding(.leading, Midad.space3)
        .padding(.trailing, 4)
        .frame(minHeight: 56)
        .background(isChosen ? Midad.raised : Midad.fill)
        .overlay(
            RoundedRectangle(cornerRadius: Midad.radiusMd, style: .continuous)
                .strokeBorder(isChosen ? Midad.lineStrong : .clear, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: Midad.radiusMd, style: .continuous))
        .shadow(color: isChosen ? Midad.ink.opacity(0.06) : .clear, radius: 2, y: 1)
    }

    private var isChosen: Bool {
        if case .chosen = state { return true }
        return false
    }

    private func clearButton(_ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: "xmark")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Midad.inkMuted)
                .frame(width: Midad.tapTarget, height: Midad.tapTarget)
                .background(Midad.fill, in: Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isChosen ? "Search for another verb" : "Cancel search")
    }
}

#Preview("WordBar · both states", traits: .sizeThatFitsLayout) {
    @Previewable @State var chosen = WordBarState.chosen(citation: "نَصَرَ يَنْصُرُ", gloss: "to help")
    @Previewable @State var searching = WordBarState.searching(query: "")
    VStack(spacing: Midad.space4) {
        WordBar(state: $chosen)
        WordBar(state: $searching)
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
