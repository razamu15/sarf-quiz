// Which verb types a student can drill.

/// Which held-back content has been released. Each gate has its own answer, so
/// adding one breaks the code that builds a `ContentGate` until it answers.
///
/// Used by: LexiconService.availableTypes. The app fills one in from Settings.
public struct ContentGate: Hashable, Sendable {
    public let mahmuz: Bool
    public let lafif: Bool

    public init(mahmuz: Bool, lafif: Bool) {
        self.mahmuz = mahmuz
        self.lafif = lafif
    }

    /// Is this group released? A group with no gate always is. A switch with no
    /// default, so a new group has to be sorted into one or the other.
    func isOpen(_ group: VerbTypeGroup) -> Bool {
        switch group {
        case .mahmuz: return mahmuz
        case .lafif:  return lafif
        case .salim, .mudaaf, .mithal, .ajwaf, .naqis: return true
        }
    }
}

extension LexiconService {
    /// The verb types a student can drill: the lexicon has roots for them, an
    /// engine answers for them, and their gate is open. Nothing else decides
    /// this.
    ///
    /// Used by: the app (as `playableTypes`), which hands the result to the quiz
    /// so the quiz never learns that gates exist.
    public func availableTypes(gate: ContentGate, conjugation: ConjugationService) -> [VerbType] {
        stockedTypes.filter { conjugation.hasEngine($0) && gate.isOpen($0.group) }
    }
}
