// What to conjugate: a root, one of its forms, and one of the nine charts.

/// A table to build. A `PronounSlot` then picks one word from it.
///
///     كتب, Form II, past active   →   كَتَّبَ  كَتَّبَا  كَتَّبُوا  ...
///
/// The chart is a `ChartShape`, so an impossible one (a passive command) can't
/// be written down.
///
/// Used by: ConjugationService, every engine, the Tables screen, the quiz.
public struct ConjugationSpec: Hashable, Sendable {
    public let root: Root
    public let form: VerbForm
    public let shape: ChartShape

    public init(root: Root, form: VerbForm, shape: ChartShape) {
        self.root = root
        self.form = form
        self.shape = shape
    }

    public var tense: Tense { shape.tense }
    public var voice: Voice { shape.voice }
    public var mood: Mood? { shape.mood }
}
