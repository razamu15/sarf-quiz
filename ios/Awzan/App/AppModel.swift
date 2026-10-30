// What the whole app shares: the verbs, the settings, and the selected tab.

import Observation
import SarfCore

/// Holds the one lexicon, the one conjugation service and the one `Settings`,
/// and answers which verb types can be drilled.
///
///     let model = try AppModel.load()
///     model.playableTypes        // sālim, muḍāʿaf, mithāl, ajwaf, nāqiṣ, until mahmūz is released
///
/// Used by: AwzanApp (makes it once), RootView and every screen's model.
@MainActor @Observable
final class AppModel {
    let settings: Settings
    let lexicon: LexiconService
    let conjugation: ConjugationService

    /// The tab on screen. It lasts as long as the app is open.
    var selectedTab: AppTab = .home

    private init(settings: Settings, lexicon: LexiconService, conjugation: ConjugationService) {
        self.settings = settings
        self.lexicon = lexicon
        self.conjugation = conjugation
    }

    /// Loads the lexicon, then the conjugation service, from what is bundled.
    /// Fails if either file is wrong, or if the service's corpus was not made
    /// from the lexicon.
    ///
    /// Takes about 0.15 s (a debug build), on the main thread, before the first
    /// screen. Used by: AwzanApp, and the tests (with their own `Settings`).
    static func load(settings: Settings = Settings()) throws -> AppModel {
        let lexicon = try LexiconService.load()
        let conjugation = try ConjugationService.load()
        return AppModel(settings: settings, lexicon: lexicon, conjugation: conjugation)
    }

    /// The verb types a student can drill: stocked in the lexicon, with an
    /// engine, and not held back by a setting. The quiz is handed this list and
    /// never sees the settings.
    ///
    /// Used by: Tables' search, Practice's setup, Home's drills.
    var playableTypes: [VerbType] {
        lexicon.availableTypes(gate: ContentGate(from: settings), conjugation: conjugation)
    }
}
