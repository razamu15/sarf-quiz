// The closed vocabulary of the domain — the flat sets everything else is written
// in. Port of the id arrays in web-prototype/js/vocabulary.js (SLOTS, AMR_SLOTS,
// slotsFor, FORM_IDS, DERIVED_NOUN_TYPES). Nothing here grows with content.
//
// EVERY RAW VALUE IN THIS FOLDER IS A STORAGE CONTRACT. The strings are the keys
// of roots.json and golden-corpus.json, and the SarfQuiz layer writes them into
// every stored WordSpec, so a user's history carries them forever. Renaming a
// CASE is free (nothing stores a case name); changing a RAW VALUE needs a data
// migration. VocabularyTests pins every raw value and its order, so a change
// fails a test instead of corrupting a history.
//
// DECLARATION ORDER IS ALSO A CONTRACT where the domain has an order: `allCases`
// is what the Tables screen iterates, so PronounSlot is in classic sarf-table
// order (3rd → 2nd → 1st person), not alphabetical.

/// The 14 pronoun slots (ṣīghāt) of a full table, named as the paper chart labels
/// them: person, gender, number.
///
///     p3ms  هُوَ      3rd person, masculine, singular
///     p3md  هُمَا     3rd person, masculine, dual
///     p1s   أَنَا     1st person, singular   (first person has no gender)
///
/// The case names carry a `p` because a Swift identifier cannot start with a
/// digit; the raw value is the chart label itself.
///
/// Slots are opaque keys: nothing in the prototype parses one into person /
/// gender / number, so no accessors for that exist here. Add them with the first
/// consumer that needs them, and write them as an explicit `switch`, never by
/// slicing the raw value.
///
/// Called by: ConjugationService.conjugate / fullTable (S0.5) as the row index;
/// every verb type's grammar table (S0.7 onward) as the key of its affix tables;
/// the Tables screen (S1.5), which iterates `tense.slots`.
public enum PronounSlot: String, CaseIterable, Codable, Sendable {
    case p3ms = "3ms", p3md = "3md", p3mp = "3mp"
    case p3fs = "3fs", p3fd = "3fd", p3fp = "3fp"
    case p2ms = "2ms", p2md = "2md", p2mp = "2mp"
    case p2fs = "2fs", p2fd = "2fd", p2fp = "2fp"
    case p1s = "1s", p1p = "1p"
}

extension Tense {
    /// The rows this tense's table has: all 14, except the amr, which exists for
    /// the 2nd person only — a command is given to someone addressed (اُكْتُبْ).
    /// The amr's six are written out rather than filtered by a person accessor
    /// because no such accessor exists (see PronounSlot).
    ///
    /// Called by: ConjugationService (S0.5), to decide which slots a chart
    /// answers and which it must reject; the Tables screen (S1.5), to draw the
    /// rows; every engine, to loop the slots of the chart it was asked for.
    public var slots: [PronounSlot] {
        switch self {
        case .madi, .mudari:
            return PronounSlot.allCases
        case .amr:
            return [.p2ms, .p2md, .p2mp, .p2fs, .p2fd, .p2fp]
        }
    }
}

/// The ten verb forms (awzān), I … X, by their traditional Roman numeral.
///
/// Named `VerbForm` and not `Form`: the app target imports SwiftUI, which has a
/// `Form` view, and two types of one name in scope is an ambiguity error at
/// every use. (The prototype calls the same thing `formId`.)
///
/// Form I is the thulāthī mujarrad, which alone has six abwāb (see `Bab`); II–X
/// are the mazīd forms, each a fixed template over the root. Which forms a root
/// HAS is a lexicon fact, not a property of this enum — and a form can be
/// recorded without being conjugable: the lexicon holds two Form IX roots (colour
/// verbs, أَحْمَرَّ) but the service generates no chart of it, so the corpus carries
/// all nine IX charts as deliberately absent.
///
/// Called by: RootFormUsage / Root.forms (S0.3) as the key of a root's recorded
/// forms; ConjugationService (S0.5) as an argument to every question; every
/// engine, to pick Form I's bāb-dependent stems or a mazīd template.
public enum VerbForm: String, CaseIterable, Codable, Sendable {
    case i = "I", ii = "II", iii = "III", iv = "IV", v = "V"
    case vi = "VI", vii = "VII", viii = "VIII", ix = "IX", x = "X"
}

/// The three derived nouns (al-mushtaqqāt) a verb throws off:
///
///     ismFail    اسْم فَاعِل    the doer         كَاتِب    "writer"
///     ismMaful   اسْم مَفْعُول   the done-to      مَكْتُوب  "written"
///     masdar     مَصْدَر        the act itself   كِتَابَة  "writing"
///
/// Declared in teaching order — doer, done-to, then the act itself — which is the
/// order the quiz offers them in.
///
/// Called by: ConjugationService.derivedNoun (S0.5), which answers nil for an
/// `ismMaful` of an intransitive verb; each verb type's DERIVED_NOUN_STEMS table
/// (S0.7 onward); Glossary (SarfQuiz) for the display label.
public enum DerivedNounType: String, CaseIterable, Codable, Sendable {
    case ismFail, ismMaful, masdar
}
