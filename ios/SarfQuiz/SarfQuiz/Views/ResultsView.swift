// End-of-quiz results: score ring, per-category breakdown, vocab recap, and
// review of missed questions — plus "new round with the same setup".

import SwiftUI
import SarfCore

struct ResultsView: View {
    var run: QuizRun
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Results")
                    .font(.largeTitle.bold())
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .accessibilityIdentifier("results-title")

                ScoreRing(percent: run.scorePercent, correct: run.correctCount, total: run.answers.count)

                resultSection("By category") {
                    VStack(spacing: 6) {
                        ForEach(run.categoryBreakdown, id: \.category) { row in
                            HStack {
                                Text(row.category.displayLabel)
                                Spacer()
                                Text("\(row.correct) / \(row.total)")
                                    .monospacedDigit()
                                    .foregroundStyle(.secondary)
                            }
                            .font(.subheadline)
                        }
                    }
                }

                if !run.vocabRecap.isEmpty {
                    resultSection("Vocab from this quiz") {
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(run.vocabRecap, id: \.word) { item in
                                Text("\(Text(item.word).font(.title3)) — “\(item.meaning)”")
                                    .font(.subheadline)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }

                if !run.missedAnswers.isEmpty {
                    resultSection("Review") {
                        VStack(alignment: .leading, spacing: 12) {
                            // Capture elements by value: `missedAnswers` is
                            // recomputed from `answers`, which "new round"
                            // empties while this view is still mounted —
                            // subscripting here by index would crash.
                            ForEach(Array(run.missedAnswers.enumerated()), id: \.offset) { _, miss in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(miss.question.word).font(.title3)
                                    Text(miss.question.explanation)
                                        .font(.footnote)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }

                VStack(spacing: 10) {
                    Button("New round (same setup)") { run.startNewRound() }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                    Button("Back to quizzes") { dismiss() }
                        .buttonStyle(.bordered)
                        .controlSize(.large)
                }
                .frame(maxWidth: .infinity)
            }
            .padding()
        }
    }

    private func resultSection(_ title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased())
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
            content()
                .padding()
                .frame(maxWidth: .infinity)
                .background(.fill.quaternary, in: RoundedRectangle(cornerRadius: 14))
        }
    }
}

private struct ScoreRing: View {
    let percent: Int
    let correct: Int
    let total: Int

    var body: some View {
        ZStack {
            Circle()
                .stroke(.fill.tertiary, lineWidth: 12)
            Circle()
                .trim(from: 0, to: Double(percent) / 100)
                .stroke(.tint, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(percent)%")
                    .font(.title.bold())
                    .monospacedDigit()
                Text("\(correct) / \(total)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: 130, height: 130)
        .padding(.vertical, 8)
    }
}
