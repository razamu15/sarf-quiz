// The bar under the title: a search field, or the verb that was chosen.

import SwiftUI

/// Shows the chosen verb's citation and meaning, or the search field. Tapping the
/// verb or its ✕ opens the search; the search's ✕ goes back to the verb.
///
/// Used by: the Tables screen.
struct WordBarSection: View {
    let model: TablesModel

    var body: some View {
        WordBar(
            state: Binding(
                get: { Self.state(of: model) },
                set: { Self.apply($0, to: model) }),
            onCancelSearch: Self.canGoBack(model) ? { model.cancelSearch() } : nil)
    }

    /// What the bar shows. A verb the engine has no citation for shows its letters.
    static func state(of model: TablesModel) -> WordBarState {
        switch model.stage {
        case .searching(let query, _):
            return .searching(query: query)
        case .reading(let verb):
            let name = model.name(of: verb)
            return .chosen(citation: name.citation ?? verb.root.spacedLetters, gloss: name.gloss.quotedAsMeaning)
        }
    }

    /// The bar only ever asks for a search: a tap on the verb, or typing.
    static func apply(_ next: WordBarState, to model: TablesModel) {
        guard case .searching(let query) = next else { return }
        if model.chosen != nil { model.startSearching() } else { model.search(query) }
    }

    /// There is a verb to go back to once one has been chosen.
    static func canGoBack(_ model: TablesModel) -> Bool {
        if case .searching(_, let verb) = model.stage { return verb != nil }
        return false
    }
}

#if DEBUG
#Preview("WordBarSection · shown, searching", traits: .sizeThatFitsLayout) {
    VStack(spacing: Midad.space4) {
        WordBarSection(model: .preview(showing: "نصر", form: .viii))
        WordBarSection(model: .preview(showing: "ضرب", form: .viii))
        WordBarSection(model: .preview(search: ""))
    }
    .padding(Midad.space4)
    .background(Midad.ground)
}
#endif
