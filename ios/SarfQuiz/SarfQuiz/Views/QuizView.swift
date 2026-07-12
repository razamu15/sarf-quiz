// The quiz screen: progress bar, word card, answer options, and instant
// feedback (contextual meaning + rule-based explanation) after each pick.
// Switches to ResultsView when the last question is answered.

import SwiftUI
import SarfCore

struct QuizView: View {
    var run: QuizRun
    @Environment(\.dismiss) private var dismiss
    @State private var confirmingQuit = false

    var body: some View {
        if run.isShowingResults {
            ResultsView(run: run)
        } else {
            questionScreen
        }
    }

    private var questionScreen: some View {
        VStack(spacing: 0) {
            topBar
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(spacing: 16) {
                        WordCard(question: run.current)
                        Text(run.current.prompt)
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        optionButtons
                        if run.isAnswered {
                            FeedbackBox(question: run.current, pickedIndex: run.pickedIndex!)
                            nextButton.id("next")
                        }
                    }
                    .padding()
                }
                .onChange(of: run.pickedIndex) {
                    guard run.isAnswered else { return }
                    withAnimation { proxy.scrollTo("next", anchor: .bottom) }
                }
            }
        }
    }

    // MARK: - Top bar

    private var topBar: some View {
        HStack(spacing: 12) {
            Button {
                confirmingQuit = true
            } label: {
                Image(systemName: "xmark")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: run.progress)
            Text("\(run.index + 1) / \(run.questions.count)")
                .font(.footnote.monospacedDigit())
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .confirmationDialog("Quit this quiz?", isPresented: $confirmingQuit, titleVisibility: .visible) {
            Button("Quit", role: .destructive) { dismiss() }
            Button("Keep going", role: .cancel) {}
        }
    }

    // MARK: - Options

    private var optionButtons: some View {
        VStack(spacing: 8) {
            // Elements captured by value (same crash-avoidance as the results
            // review list): the options array is swapped out under this
            // ForEach every time the question advances.
            ForEach(Array(run.current.options.enumerated()), id: \.offset) { optionIndex, option in
                OptionButton(
                    option: option,
                    state: optionState(optionIndex)
                ) { run.pick(optionIndex) }
                    .accessibilityIdentifier("option-\(optionIndex)")
            }
        }
    }

    private func optionState(_ optionIndex: Int) -> OptionButton.State {
        guard let picked = run.pickedIndex else { return .active }
        if optionIndex == run.current.correctIndex { return .correct }
        if optionIndex == picked { return .wrong }
        return .dimmed
    }

    private var nextButton: some View {
        Button(run.isLastQuestion ? "See results" : "Next") {
            run.advance()
        }
        .buttonStyle(.borderedProminent)
        .controlSize(.large)
        .frame(maxWidth: .infinity)
        .accessibilityIdentifier("advance")
    }
}

// MARK: - Word card

private struct WordCard: View {
    let question: Question

    var body: some View {
        VStack(spacing: 8) {
            if let tag = question.bundleTag {
                Text(tag)
                    .font(.caption2.smallCaps())
                    .foregroundStyle(.secondary)
            }
            Text(question.word)
                .font(.system(size: 46, weight: .medium))
                .minimumScaleFactor(0.5)
                .lineLimit(1)
            if !question.gloss.isEmpty {
                Text("“\(question.gloss)”")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Text(question.category.displayLabel)
                .font(.caption)
                .padding(.horizontal, 10)
                .padding(.vertical, 3)
                .background(.tint.opacity(0.15), in: Capsule())
                .foregroundStyle(.tint)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .background(.fill.quaternary, in: RoundedRectangle(cornerRadius: 18))
    }
}

// MARK: - Option button

private struct OptionButton: View {
    enum State { case active, correct, wrong, dimmed }

    let option: AnswerOption
    let state: State
    let pick: () -> Void

    var body: some View {
        Button(action: pick) {
            HStack {
                if !option.english.isEmpty {
                    Text(option.english)
                        .font(.subheadline)
                        .multilineTextAlignment(.leading)
                }
                Spacer()
                Text(option.arabic)
                    .font(.title3)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(background, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(border, lineWidth: 1.5))
        }
        .buttonStyle(.plain)
        .disabled(state != .active)
        .opacity(state == .dimmed ? 0.45 : 1)
    }

    private var background: AnyShapeStyle {
        switch state {
        case .correct: AnyShapeStyle(.green.opacity(0.18))
        case .wrong:   AnyShapeStyle(.red.opacity(0.18))
        default:       AnyShapeStyle(.fill.quaternary)
        }
    }

    private var border: AnyShapeStyle {
        switch state {
        case .correct: AnyShapeStyle(.green)
        case .wrong:   AnyShapeStyle(.red)
        default:       AnyShapeStyle(.clear)
        }
    }
}

// MARK: - Feedback

private struct FeedbackBox: View {
    let question: Question
    let pickedIndex: Int

    private var isCorrect: Bool { pickedIndex == question.correctIndex }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !question.fullMeaning.isEmpty {
                Text("\(question.word) — “\(question.fullMeaning)”")
                    .font(.subheadline)
            }
            Text("\(Text(isCorrect ? "Correct!" : "Not quite.").bold()) \(question.explanation)")
                .font(.subheadline)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(
            (isCorrect ? Color.green : Color.red).opacity(0.12),
            in: RoundedRectangle(cornerRadius: 12)
        )
    }
}
