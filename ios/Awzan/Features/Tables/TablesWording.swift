// The words the Tables sections write, kept apart from the views so they can be
// tested without drawing anything.

import SarfCore
import SarfQuiz

extension Root {
    /// The letters apart, as a root is written.
    ///
    ///     نصر   →   "ن ص ر"
    ///
    /// Used by: the Tables search, and the bar and rows when the engine has no
    /// citation to show.
    var spacedLetters: String { key.map(String.init).joined(separator: " ") }
}

extension TablesModel.ChartLine {
    /// The chart in words. The present adds its mood.
    ///
    ///     Form I · māḍī · maʿrūf
    ///     Form I · muḍāriʿ · maʿrūf · marfūʿ
    ///     Form I · amr
    ///
    /// Used by: the line above "View the table".
    var title: String {
        var parts = ["Form \(form.rawValue)", tense.term.english]
        if let voice { parts.append(voice.term.english) }
        if let mood { parts.append(mood.term.english) }
        return parts.joined(separator: " · ")
    }

    /// "14 ṣiyagh", or "6 ṣiyagh" for the command.
    var countText: String { "\(rowCount) ṣiyagh" }
}

extension String {
    /// A meaning as the screens show it.
    ///
    ///     to help   →   “to help”
    ///
    /// Used by: the word bar, the search rows.
    var quotedAsMeaning: String { "“\(self)”" }
}

extension TablesModel.SearchResult {
    /// The verb as its row names it: the citation, or the letters when the engine
    /// has no citation for the form the row opens in.
    var title: String { citation ?? root.spacedLetters }

    /// What the row says under the title.
    ///
    ///     “to help” · 5 forms · Sound
    var subtitle: String {
        [gloss.quotedAsMeaning, formCount == 1 ? "1 form" : "\(formCount) forms", group.term.english].joined(separator: " · ")
    }
}

extension TablesModel.MajhulGap {
    /// The reason under the voice row.
    ///
    ///     خَرَجَ is intransitive — it has no majhūl.
    var sentence: String {
        switch self {
        case .intransitive(let pastWord):
            return "\(pastWord ?? "This verb") is intransitive — it has no majhūl."
        }
    }
}

/// The sentences with no verb in them.
///
/// Used by: the pickers, the line under them, the search results.
enum TablesCopy {
    static let commandHasNoVoiceOrMood = "The amr has neither voice nor iʿrāb."
    static let noChart = "This verb has no chart for that selection."

    static func nothingMatches(_ query: String) -> String {
        "Nothing matches “\(query)”."
    }
}
