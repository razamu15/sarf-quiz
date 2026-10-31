// Models and a page of states for looking at the Tables sections. Not part of
// the real app.

#if DEBUG
import SarfCore
import SwiftUI

extension TablesModel {
    /// A model on the real lexicon and the bundled corpus, in the state asked
    /// for. With a `search` it is searching; otherwise a verb is shown.
    ///
    ///     .preview(showing: "نصر", form: .viii, tense: .mudari)
    ///
    /// Used by: the sections' previews and `TablesSectionsGallery`.
    @MainActor
    static func preview(
        showing key: String? = nil,
        form: VerbForm? = nil,
        tense: Tense = .madi,
        voice: Voice = .malum,
        mood: Mood = .raf,
        tableOpen: Bool = false,
        search: String? = nil
    ) -> TablesModel {
        do {
            let lexicon = try LexiconService.load()
            let conjugation = try ConjugationService.load()
            let model = TablesModel(lexicon: lexicon, conjugation: conjugation) {
                lexicon.availableTypes(gate: ContentGate(mahmuz: false, lafif: false), conjugation: conjugation)
            }
            if let key {
                guard let row = model.results.first(where: { $0.root.key == key }) else { fatalError("no root \(key)") }
                model.choose(row)
                if let form { model.select(form: form) }
                model.select(tense: tense)
                model.select(voice: voice)
                model.select(mood: mood)
                if tableOpen { model.viewTable() }
            }
            if let search {
                if model.chosen != nil { model.startSearching() }
                model.search(search)
            }
            return model
        } catch {
            fatalError("preview model: \(error)")
        }
    }
}

/// Every state of the sections, one under the other, as the screen will stack
/// them. Shown by `AWZAN_GALLERY=tables` in a debug build, and as a preview.
struct TablesSectionsGallery: View {
    private struct Case: Identifiable {
        let title: String
        let model: TablesModel
        var id: String { title }
    }

    private let cases: [Case] = [
        Case(title: "First open", model: .preview()),
        Case(title: "Searching “help”", model: .preview(search: "help")),
        Case(title: "Searching, nothing matches", model: .preview(search: "zzzz")),
        Case(title: "كتب shown", model: .preview(showing: "كتب")),
        Case(title: "Present, passive, nasb", model: .preview(showing: "كتب", tense: .mudari, voice: .majhul, mood: .nasb)),
        Case(title: "The command", model: .preview(showing: "نصر", tense: .amr)),
        Case(title: "Intransitive (خرج)", model: .preview(showing: "خرج")),
        Case(title: "No chart (Form IX)", model: .preview(showing: "حمر", form: .ix)),
        Case(title: "No citation (Form VIII of ضرب)", model: .preview(showing: "ضرب", form: .viii)),
        Case(title: "Table open", model: .preview(showing: "نصر", tableOpen: true)),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Midad.space8) {
                ForEach(cases) { item in
                    VStack(alignment: .leading, spacing: Midad.space4) {
                        Text(item.title.bidiIsolated)
                            .typeStyle(.caption)
                            .foregroundStyle(Midad.sign)
                        sections(item.model)
                    }
                }
            }
            .padding(.horizontal, Midad.space4)
            .padding(.vertical, Midad.space6)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Midad.ground)
    }

    /// What the screen shows for one model: the bar, then the list or the pickers.
    @ViewBuilder
    private func sections(_ model: TablesModel) -> some View {
        VStack(alignment: .leading, spacing: Midad.space4) {
            WordBarSection(model: model)
            if model.chosen == nil {
                // Only the top of a long list, at its natural row height.
                VerbResultsSection(model: model)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxHeight: 220, alignment: .top)
                    .clipped()
            } else {
                FormChipsSection(model: model)
                ChartPickersSection(model: model)
                ChartLineSection(model: model)
            }
        }
    }
}

#Preview("Tables sections · every state") {
    TablesSectionsGallery()
}
#endif
