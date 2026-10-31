// What the Tables tab remembers: the verb, its form, the chart's pickers, and
// whether the table is showing.

import Observation
import SarfCore

/// The state behind the Tables screen, and every way to change it.
///
///     model.choose(result)           // a verb, in its first form
///     model.select(form: .viii)
///     model.select(tense: .mudari)
///     model.viewTable()
///     model.chart                    // .open(line, rows: ...)
///
/// Every change to the verb or to a picker puts the table away, so the table on
/// screen is always the chart that was asked for.
///
/// Used by: AppModel (makes one, so the choice lasts while the app is open), the
/// Tables screen.
@MainActor @Observable
final class TablesModel {
    let lexicon: LexiconService
    let conjugation: ConjugationService
    /// A function and not a list, because a content switch can change it while
    /// the app is open.
    let playableTypes: @MainActor () -> [VerbType]
    /// Every root in Arabic alphabet order, which is the order the search lists.
    let rootsAlphabetically: [Root]

    private(set) var stage: Stage = .searching(query: "", returningTo: nil)

    // The pickers. The voice and the mood are kept while their rows are hidden,
    // so going from the command back to the present finds them as they were.
    private(set) var tense: Tense = .madi
    private(set) var voice: Voice = .malum
    private(set) var mood: Mood = .raf

    private(set) var isTableOpen = false

    init(
        lexicon: LexiconService,
        conjugation: ConjugationService,
        playableTypes: @escaping @MainActor () -> [VerbType]
    ) {
        self.lexicon = lexicon
        self.conjugation = conjugation
        self.playableTypes = playableTypes
        // Arabic letters sit in Unicode in alphabet order (ء ب ت ... ي), so comparing
        // letter by letter sorts the roots.
        rootsAlphabetically = lexicon.roots.sorted {
            $0.key.unicodeScalars.lexicographicallyPrecedes($1.key.unicodeScalars) { $0.value < $1.value }
        }
    }

    /// The verb being shown, or nil while searching.
    var chosen: ChosenVerb? {
        if case .reading(let verb) = stage { return verb }
        return nil
    }

    // MARK: The word bar

    /// Opens the search, from the verb that is shown. The ✕ then comes back to it.
    func startSearching() {
        guard let verb = chosen else { return }
        stage = .searching(query: "", returningTo: verb)
    }

    func search(_ query: String) {
        guard case .searching(_, let verb) = stage else { return }
        stage = .searching(query: query, returningTo: verb)
    }

    /// Goes back to the verb that was shown. On the first open there is none, so
    /// nothing happens.
    func cancelSearch() {
        guard case .searching(_, let verb?) = stage else { return }
        stage = .reading(verb)
    }

    /// Shows a verb from the search, in the form its row opens in.
    func choose(_ result: SearchResult) {
        guard case .searching = stage else { return }
        guard let verb = ChosenVerb(result.root, result.form) else {
            preconditionFailure("\(result.root.key) is not used in Form \(result.form.rawValue)")
        }
        stage = .reading(verb)
        dropMajhulIfUnavailable(for: verb)
        isTableOpen = false
    }

    // MARK: The pickers

    func select(form: VerbForm) {
        // The root has to use the form, which the chips only offer.
        guard let verb = chosen, form != verb.form, let next = ChosenVerb(verb.root, form) else { return }
        stage = .reading(next)
        dropMajhulIfUnavailable(for: next)
        isTableOpen = false
    }

    func select(tense: Tense) {
        guard chosen != nil, tense != self.tense else { return }
        self.tense = tense
        isTableOpen = false
    }

    func select(voice: Voice) {
        guard chosen != nil, voice != self.voice else { return }
        self.voice = voice
        isTableOpen = false
    }

    func select(mood: Mood) {
        guard chosen != nil, mood != self.mood else { return }
        self.mood = mood
        isTableOpen = false
    }

    /// Shows the chart the pickers name. Nothing happens if there is none.
    func viewTable() {
        guard case .waiting = chart else { return }
        isTableOpen = true
    }

    /// Moving to a verb that has no passive leaves maʿrūf selected. The voice row
    /// says why majhūl is off.
    private func dropMajhulIfUnavailable(for verb: ChosenVerb) {
        if voice == .majhul && !conjugation.hasPassive(verb.root, form: verb.form) {
            voice = .malum
        }
    }

    // FUTURE FIX: a verb stays shown if a content switch holds its type back while
    // it is open. The search stops listing it; the bar and the chart do not notice.
}
