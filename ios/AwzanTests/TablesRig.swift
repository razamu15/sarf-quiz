// A Tables model built on the real lexicon and the bundled corpus, for the Tables
// tests.

import SarfCore
import Testing
@testable import Awzan

/// Which verb types the rig lets through. Sālim to nāqiṣ by default, as the app
/// does until a content switch is flipped.
@MainActor
struct TablesRig {
    let lexicon: LexiconService
    let conjugation: ConjugationService
    let model: TablesModel

    init(gate: ContentGate = ContentGate(mahmuz: false, lafif: false)) throws {
        let lexicon = try LexiconService.load()
        let conjugation = try ConjugationService.load()
        self.lexicon = lexicon
        self.conjugation = conjugation
        model = TablesModel(lexicon: lexicon, conjugation: conjugation) {
            lexicon.availableTypes(gate: gate, conjugation: conjugation)
        }
    }

    func root(_ key: String) throws -> Root {
        try #require(lexicon.root(forKey: key), "no root \(key)")
    }

    /// Shows a verb as a student would: search, tap the row, then pick a form.
    func show(_ key: String, form: VerbForm? = nil) throws {
        if model.chosen != nil { model.startSearching() }
        model.search("")
        let row = try #require(model.results.first { $0.root.key == key }, "no row for \(key)")
        model.choose(row)
        if let form { model.select(form: form) }
    }

    /// The chart as the engine gives it, for checking what the model shows.
    func words(_ key: String, _ form: VerbForm, _ shape: ChartShape) throws -> [PronounSlot: String]? {
        conjugation.fullTable(ConjugationSpec(root: try root(key), form: form, shape: shape))
    }
}
