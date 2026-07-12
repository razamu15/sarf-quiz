// Home: the three tabs from the prototype — Form I drills, mazīd fīhi drills,
// and the custom quiz builder. (Stats and Settings tabs arrive in later
// phases.)

import SwiftUI
import SarfCore

struct HomeView: View {
    var body: some View {
        TabView {
            FormOneTab()
                .tabItem { Label("Form I", systemImage: "1.square") }
            MazeedTab()
                .tabItem { Label("Mazīd fīhi", systemImage: "plus.square.on.square") }
            CustomQuizBuilderView()
                .tabItem { Label("Custom", systemImage: "slider.horizontal.3") }
        }
    }
}

// MARK: - Form I drills

private struct FormOneTab: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    TabIntro("Form I (mujarrad) drills by verb type: \(QuizGenerator.wordsPerDrill) words, 3 questions per word — tense, maʿlūm/majhūl, then the pronoun.")
                    ForEach(DrillPreset.formOneDrills, id: \.id) { preset in
                        PresetCard(
                            title: preset.title,
                            arabic: preset.arabicTitle,
                            detail: preset.detail,
                            isAvailable: model.generator.isDrillAvailable(preset)
                        ) {
                            model.startQuiz { model.generator.simpleQuiz(preset: preset) }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Sarf Quiz")
        }
    }
}

// MARK: - Mazīd fīhi drills

private struct MazeedTab: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    TabIntro("The same drill, one mazīd fīhi form at a time: \(QuizGenerator.wordsPerDrill) words, 3 questions per word.")
                    ForEach(FormID.mazeedForms, id: \.rawValue) { form in
                        let preset = model.generator.mazeedDrill(for: form)
                        PresetCard(
                            title: "Form \(form.rawValue)",
                            arabic: shortArabicName(of: form),
                            detail: detail(of: form, preset: preset),
                            isAvailable: model.generator.isDrillAvailable(preset)
                        ) {
                            model.startQuiz { model.generator.simpleQuiz(preset: preset) }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Mazīd fīhi")
        }
    }

    /// "بَابُ التَّفْعِيل" → "التَّفْعِيل" (the card already says "Form II").
    private func shortArabicName(of form: FormID) -> String {
        model.content.grammar.form(form).name.replacingOccurrences(of: "بَابُ ", with: "")
    }

    /// Wazn citation plus the bāb's meaning hints, e.g.
    /// "فَعَّلَ يُفَعِّلُ — making the verb transitive · intensity / repetition".
    private func detail(of form: FormID, preset: DrillPreset) -> String {
        let hints = model.content.grammar.form(form).meanings
            .compactMap { model.content.grammar.meaningLabel($0)?.en.components(separatedBy: " (").first }
            .joined(separator: " · ")
        return hints.isEmpty ? preset.detail : "\(preset.detail) — \(hints)"
    }
}

// MARK: - Shared pieces

struct TabIntro: View {
    private let text: String
    init(_ text: String) { self.text = text }

    var body: some View {
        Text(text)
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .padding(.bottom, 4)
    }
}

struct PresetCard: View {
    let title: String
    let arabic: String
    let detail: String
    let isAvailable: Bool
    let start: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text(title).font(.headline)
                    Text(arabic).font(.subheadline).foregroundStyle(.secondary)
                }
                Text(detail)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button(isAvailable ? "Start" : "Soon", action: start)
                .buttonStyle(.borderedProminent)
                .disabled(!isAvailable)
        }
        .padding()
        .background(.fill.quaternary, in: RoundedRectangle(cornerRadius: 14))
        .opacity(isAvailable ? 1 : 0.55)
    }
}
