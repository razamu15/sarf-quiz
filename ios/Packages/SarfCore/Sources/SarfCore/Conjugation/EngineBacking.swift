// Where each verb group's words come from.

/// How a verb group gets its words.
enum EngineBacking: Hashable, Sendable {
    /// Built by the group's own engine.
    case engine
    /// Looked up in the exported corpus (golden-corpus.json).
    case corpus
    /// No engine and no corpus entry. Every word is nil.
    case unbuilt
}

/// The backing of each group. Flipping a group to `.engine` is this line and the
/// group's entry in `ConjugationService.engines`; the service won't load with
/// one and not the other.
///
/// ACCEPTED TRADE-OFF: until a group is `.engine`, its words are looked up, not
/// generated. Prefix / stem / suffix output can't come from a string corpus, so
/// anything that needs it waits for the engines.
///
/// A switch with no default, so a new group can't be left out.
///
/// Used by: ConjugationService (checks its engines against this), load.
func engineBacking(for group: VerbTypeGroup) -> EngineBacking {
    switch group {
    case .salim:   return .corpus
    case .mahmuz:  return .corpus
    case .mudaaf:  return .corpus
    case .mithal:  return .corpus
    case .ajwaf:   return .corpus
    case .naqis:   return .corpus
    case .lafif:   return .unbuilt
    }
}
