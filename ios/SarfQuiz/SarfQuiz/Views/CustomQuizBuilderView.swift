// The custom-practice builder: pick categories × forms × verb types × count,
// mirroring the prototype's chip pickers. Defaults match the prototype.

import SwiftUI
import SarfCore

struct CustomQuizBuilderView: View {
    @Environment(AppModel.self) private var model

    @State private var categories: Set<QuestionCategory> = [.tense, .voice, .doer, .wazn]
    @State private var forms: Set<FormID> = [.I, .II, .V, .X]
    @State private var verbTypes: Set<VerbType> = [.salim]
    @State private var questionCount = 10
    @State private var showingEmptySelectionAlert = false

    private var canStart: Bool {
        !categories.isEmpty && !forms.isEmpty && !verbTypes.isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    section("What to quiz") {
                        ChipFlow {
                            ForEach(QuestionCategory.allCases, id: \.rawValue) { category in
                                Chip(
                                    label: category.displayLabel,
                                    arabic: category.arabicLabel,
                                    isSelected: categories.contains(category)
                                ) { toggle(category, in: &categories) }
                            }
                        }
                    }

                    section("Abwāb / forms") {
                        ChipFlow {
                            ForEach(FormID.allCases, id: \.rawValue) { form in
                                Chip(
                                    label: form.rawValue,
                                    arabic: shortArabicName(of: form),
                                    isSelected: forms.contains(form)
                                ) { toggle(form, in: &forms) }
                            }
                        }
                    }

                    section("Verb types") {
                        ChipFlow {
                            ForEach(VerbType.allCases, id: \.rawValue) { type in
                                let info = model.content.grammar.verbTypeInfo(type)
                                let hasContent = model.content.availableVerbTypes.contains(type)
                                Chip(
                                    label: info.en.components(separatedBy: " (").first ?? info.en,
                                    arabic: info.ar,
                                    isSelected: verbTypes.contains(type),
                                    isEnabled: hasContent,
                                    disabledNote: "content coming"
                                ) { toggle(type, in: &verbTypes) }
                            }
                        }
                    }

                    section("Questions") {
                        ChipFlow {
                            ForEach([5, 10, 20], id: \.self) { count in
                                Chip(label: "\(count)", isSelected: questionCount == count) {
                                    questionCount = count
                                }
                            }
                        }
                    }

                    Button("Start quiz", action: startQuiz)
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .frame(maxWidth: .infinity)
                        .disabled(!canStart)
                }
                .padding()
            }
            .navigationTitle("Custom practice")
            .alert("No questions possible for this selection — widen the forms or categories.",
                   isPresented: $showingEmptySelectionAlert) {
                Button("OK", role: .cancel) {}
            }
        }
    }

    private func startQuiz() {
        // Preserve canonical order regardless of tap order.
        let settings = QuizSettings(
            categories: QuestionCategory.allCases.filter(categories.contains),
            forms: FormID.allCases.filter(forms.contains),
            verbTypes: VerbType.allCases.filter(verbTypes.contains),
            questionCount: questionCount
        )
        let started = model.startQuiz { [generator = model.generator] in
            generator.customQuiz(settings: settings)
        }
        if !started { showingEmptySelectionAlert = true }
    }

    private func toggle<T: Hashable>(_ value: T, in set: inout Set<T>) {
        if !set.insert(value).inserted { set.remove(value) }
    }

    private func shortArabicName(of form: FormID) -> String {
        model.content.grammar.form(form).name.replacingOccurrences(of: "بَابُ ", with: "")
    }

    private func section(_ title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased())
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
            content()
        }
    }
}

// MARK: - Chips

/// A tappable selection chip: English label with an optional small Arabic
/// sub-label, filled when selected.
struct Chip: View {
    let label: String
    var arabic: String? = nil
    let isSelected: Bool
    var isEnabled: Bool = true
    var disabledNote: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 1) {
                Text(label).font(.subheadline)
                if let arabic {
                    Text(arabic).font(.caption2).opacity(0.8)
                }
                if !isEnabled, let disabledNote {
                    Text(disabledNote).font(.caption2).italic().opacity(0.6)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                isSelected ? AnyShapeStyle(.tint.opacity(0.2)) : AnyShapeStyle(.fill.quaternary),
                in: Capsule()
            )
            .overlay(Capsule().strokeBorder(isSelected ? AnyShapeStyle(.tint) : AnyShapeStyle(.clear), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .foregroundStyle(isSelected ? AnyShapeStyle(.tint) : AnyShapeStyle(.primary))
        .disabled(!isEnabled)
        .opacity(isEnabled ? 1 : 0.45)
    }
}

/// Wraps chips onto as many rows as needed (SwiftUI has no built-in flow
/// layout).
struct ChipFlow: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > 0, x + size.width > maxWidth {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: proposal.width ?? x, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, rowHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > bounds.minX, x + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
