// One quiz from first question to results screen: the observable state the
// quiz and results views render. Holds its rebuild closure so "New round
// (same setup)" can regenerate fresh questions from the same configuration.

import Foundation
import Observation
import SarfCore

@MainActor
@Observable
final class QuizRun: Identifiable {
    struct Answer {
        let question: Question
        let pickedIndex: Int
        var isCorrect: Bool { pickedIndex == question.correctIndex }
    }

    let id = UUID()
    private let rebuild: () -> [Question]

    private(set) var questions: [Question]
    private(set) var index = 0
    private(set) var answers: [Answer] = []
    /// The option picked for the current question; nil until answered.
    private(set) var pickedIndex: Int?
    private(set) var isShowingResults = false

    init(questions: [Question], rebuild: @escaping () -> [Question]) {
        self.questions = questions
        self.rebuild = rebuild
    }

    // MARK: - Quiz progress

    var current: Question { questions[index] }
    var isAnswered: Bool { pickedIndex != nil }
    var isLastQuestion: Bool { index == questions.count - 1 }
    var progress: Double { Double(index) / Double(questions.count) }

    func pick(_ optionIndex: Int) {
        guard !isAnswered else { return }
        pickedIndex = optionIndex
        answers.append(Answer(question: current, pickedIndex: optionIndex))
    }

    func advance() {
        guard isAnswered else { return }
        if isLastQuestion {
            isShowingResults = true
        } else {
            index += 1
            pickedIndex = nil
        }
    }

    /// Regenerates questions from the same setup and restarts.
    func startNewRound() {
        let fresh = rebuild()
        guard !fresh.isEmpty else { return }
        questions = fresh
        index = 0
        answers = []
        pickedIndex = nil
        isShowingResults = false
    }

    // MARK: - Results

    var correctCount: Int { answers.filter(\.isCorrect).count }

    var scorePercent: Int {
        answers.isEmpty ? 0 : Int((Double(correctCount) / Double(answers.count) * 100).rounded())
    }

    /// Per-category score rows, in the canonical category order.
    var categoryBreakdown: [(category: QuestionCategory, correct: Int, total: Int)] {
        QuestionCategory.allCases.compactMap { category in
            let inCategory = answers.filter { $0.question.category == category }
            guard !inCategory.isEmpty else { return nil }
            return (category, inCategory.filter(\.isCorrect).count, inCategory.count)
        }
    }

    /// Every distinct word seen this quiz with its contextual meaning —
    /// the vocab-enrichment recap.
    var vocabRecap: [(word: String, meaning: String)] {
        var seen = Set<String>()
        return answers.compactMap { answer in
            let question = answer.question
            guard !question.fullMeaning.isEmpty, seen.insert(question.word).inserted else { return nil }
            return (question.word, question.fullMeaning)
        }
    }

    var missedAnswers: [Answer] { answers.filter { !$0.isCorrect } }
}
