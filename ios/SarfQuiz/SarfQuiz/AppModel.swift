// The app's single composition root: loads content once at launch and hands
// the engine to the views. One ContentStore/QuizGenerator instance by
// construction (dependency injection, not singletons — see GrammarTables).

import Observation
import SarfCore

@MainActor
@Observable
final class AppModel {
    let content: ContentStore
    let generator: QuizGenerator

    /// The quiz in progress; non-nil drives the full-screen quiz cover.
    var run: QuizRun?

    init() {
        do {
            content = try ContentStore.loadBundled()
        } catch {
            // Content ships inside the app bundle and is validated by the
            // export pipeline + smoke tests; failing to load it is a build
            // defect, not a runtime condition the UI could recover from.
            fatalError("Bundled content failed to load: \(error)")
        }
        generator = QuizGenerator(content: content)
    }

    /// Builds and starts a quiz. Returns false when the builder produced no
    /// questions (impossible selection) so the caller can show an alert —
    /// mirrors the prototype's alert path.
    @discardableResult
    func startQuiz(_ build: @escaping () -> [Question]) -> Bool {
        let questions = build()
        guard !questions.isEmpty else { return false }
        run = QuizRun(questions: questions, rebuild: build)
        return true
    }
}
