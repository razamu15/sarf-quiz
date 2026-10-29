// The small fixed sets the rest of the code is built from: pronoun slots, verb
// forms (I–X) and the three derived nouns.
//
// Every raw value here is also used in roots.json and in saved quiz history, so
// don't change one without migrating saved data. Tests pin them all.

/// The 14 pronoun slots of a conjugation table, in the order a sarf chart lists
/// them (3rd person, then 2nd, then 1st).
///
///     p3ms  هُوَ    3rd person, masculine, singular
///     p3fd  هُمَا    3rd person, feminine, dual
///     p1s   أَنَا    1st person, singular
///
/// Case names start with `p` because a Swift name can't start with a digit.
///
/// Used by: ConjugationService (picks the row), each verb type's grammar tables,
/// the Tables screen.
public enum PronounSlot: String, CaseIterable, Codable, Sendable {
    case p3ms = "3ms", p3md = "3md", p3mp = "3mp"
    case p3fs = "3fs", p3fd = "3fd", p3fp = "3fp"
    case p2ms = "2ms", p2md = "2md", p2mp = "2mp"
    case p2fs = "2fs", p2fd = "2fd", p2fp = "2fp"
    case p1s = "1s", p1p = "1p"
}

extension Tense {
    /// The rows of this tense's table: all 14, except the command (amr), which
    /// only exists for "you" and has 6.
    ///
    /// Used by: ConjugationService, every engine, the Tables screen.
    public var slots: [PronounSlot] {
        switch self {
        case .madi, .mudari:
            return PronounSlot.allCases
        case .amr:
            return [.p2ms, .p2md, .p2mp, .p2fs, .p2fd, .p2fp]
        }
    }
}

/// The ten verb forms, by Roman numeral. Form I is the basic verb (كَتَبَ);
/// II–X add letters to it (كَتَّبَ, كَاتَبَ, ...).
///
/// Named `VerbForm` because SwiftUI already has a `Form`.
///
/// Used by: Root (which forms a root has), ConjugationService, every engine.
public enum VerbForm: String, CaseIterable, Codable, Sendable {
    case i = "I", ii = "II", iii = "III", iv = "IV", v = "V"
    case vi = "VI", vii = "VII", viii = "VIII", ix = "IX", x = "X"
}

/// The three nouns a verb produces:
///
///     ismFail    the doer        كَاتِب     "writer"
///     ismMaful   the done-to     مَكْتُوب   "written"
///     masdar     the act itself  كِتَابَة    "writing"
///
/// Used by: ConjugationService.derivedNoun, each verb type's noun tables, the
/// quiz.
public enum DerivedNounType: String, CaseIterable, Codable, Sendable {
    case ismFail, ismMaful, masdar
}
