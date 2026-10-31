// The verbs the search lists.

import Foundation
import SarfCore

extension TablesModel {
    /// The playable verbs that match what was typed, in alphabet order. Empty
    /// unless searching.
    ///
    /// A verb matches when its letters (with or without spaces) or the meaning of
    /// any of its forms contains the text. Conjugated words are not searched.
    ///
    ///     "نصر"  "ن ص ر"  "triumph"   all find نصر
    ///     "يَنْصُرُونَ"                 finds nothing
    ///
    /// Used by: the search results list.
    var results: [SearchResult] {
        guard case .searching(let query, _) = stage else { return [] }
        let playable = Set(playableTypes())
        let wanted = query.trimmingCharacters(in: .whitespaces).lowercased()
        return rootsAlphabetically
            .filter { playable.contains($0.verbType) && matches($0, wanted) }
            .map(result(for:))
    }

    private func matches(_ root: Root, _ wanted: String) -> Bool {
        if wanted.isEmpty { return true }
        return root.key.contains(wanted)
            || root.spacedLetters.contains(wanted)
            || root.forms.values.contains { $0.gloss.lowercased().contains(wanted) }
    }

    private func result(for root: Root) -> SearchResult {
        // recordedForms starts at Form I, so a root without one opens in its first.
        guard let form = root.recordedForms.first, let details = root.forms[form] else {
            preconditionFailure("root \(root.key) has no forms")
        }
        return SearchResult(
            root: root,
            form: form,
            citation: conjugation.citation(root, form: form),
            gloss: details.gloss,
            formCount: root.forms.count,
            group: root.verbType.group)
    }
}
