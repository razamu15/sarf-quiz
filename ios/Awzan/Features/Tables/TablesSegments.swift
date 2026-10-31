// The options of the three pickers, as the segmented rows take them.

import SarfCore
import SarfQuiz

/// What each picker offers. The tense row shows the Arabic with the Latin; the
/// voice and iʿrāb rows show only the Latin.
///
/// Used by: the Tables pickers.
enum TablesSegments {
    static var tense: [Segment<Tense>] {
        Tense.allCases.map { Segment($0, english: $0.term.english, arabic: $0.term.arabic) }
    }

    /// Majhūl is switched off, with the reason, when the verb has no passive.
    static func voice(gap: TablesModel.MajhulGap?) -> [Segment<Voice>] {
        Voice.allCases.map { voice in
            Segment(voice, english: voice.term.english, disabledReason: voice == .majhul ? gap?.sentence : nil)
        }
    }

    static var mood: [Segment<Mood>] {
        Mood.allCases.map { Segment($0, english: $0.term.english) }
    }
}
