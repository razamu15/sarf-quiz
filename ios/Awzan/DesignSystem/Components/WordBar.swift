// Tables' one field, in two exclusive states: searching, or a verb chosen.
//
// The exclusivity is the design (🎨 D-46). A search field that merely sat above
// the results would let the screen show one verb's chart while a search for
// another was open — two answers to "what am I looking at?". So choosing a verb
// takes the bar over, and the ✕ is the only way back.
//
// Used by: Tables (D2). Nothing else has this shape.

import SwiftUI

/// What the bar is showing. A two-case enum rather than an optional verb plus a
/// `isSearching` flag: the two would let `(searching, verb chosen)` exist, which
/// is precisely the state the design rules out.
public enum WordBarState: Equatable {
    /// No verb chosen yet, or the ✕ was tapped. Carries the live query.
    case searching(query: String)
    /// A verb is chosen. The citation and gloss are **of the root AND the chosen
    /// form** — pick Form VIII of نصر and the bar reads اِنْتَصَرَ, "to triumph".
    case chosen(citation: String, gloss: String)
}

public struct WordBar: View {
    @Binding private var state: WordBarState
    /// What ✕ does depends on which state it sits in, and the two are different
    /// actions rather than one toggle: from `chosen` it opens search; from
    /// `searching` it CANCELS — back to the chosen verb with the selection
    /// intact. A caller that has nothing to go back to passes nil.
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
                            // The citation wins the space. Without this the
                            // gloss keeps its full width at large Dynamic Type
                            // and نَصَرَ يَنْصُرُ truncates to نَصَ… — the bar
                            // then answers "which verb am I looking at?" with
                            // half a word, which is the one thing it is for.
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
