// Verb types, in the two layers the app deliberately keeps apart. Port of
// VERB_TYPE_IDS / VERB_TYPE_GROUP_IDS / groupOfVerbType / verbTypesInGroup in
// web-prototype/js/vocabulary.js — with ONE deliberate difference: the JS keeps
// the two lafīf types as two groups; here they are one (`.lafif`). The owner's
// call, 2026-10-29; the JS is still to be brought into line (IOS_PORT_PLAN
// follow-ups).
//
//   ENGINE layer  `VerbType`       what the engine routes on, and what is stored
//   USER layer    `VerbTypeGroup`  what a student picks; never stored
//
// The weak types are split by WHICH letter is weak, because و and ي do not behave
// alike in the same slot: يَقُولُ keeps its wāw as a long ū while يَبِيعُ keeps its
// yāʾ as a long ī, and نَامَ / بَاعَ both show alif in the māḍī but unfold to نُمْتُ
// vs بِعْتُ. One conjugator per split type is what keeps those table-driven
// instead of becoming branches. Above the engine the split is invisible: Practice
// shows one "Ajwaf" chip and it selects both — and one "Lafīf" chip, for the same
// reason (below).

/// A verb type as the engine sees it. Raw values are a storage contract (see
/// Vocabulary.swift) — they are the `"type"` of every root in roots.json and
/// the `verbType` of every stored WordSpec.
///
/// LAFĪF splits on a different axis from the others: not WHICH letter is weak but
/// WHERE the two weak letters sit — mafrūq (فاء and لام weak with a sound ʿayn
/// between, وَقَى) vs maqrūn (the two weak letters adjacent, طَوَى). The engine
/// routes on that split; the student does not see it as two types — both belong
/// to the one `.lafif` group, as the two wāw/yāʾ types of mithāl do to `.mithal`.
/// Whether one engine or two serves them is the engine layer's question
/// (IOS_PORT_PLAN R7).
///
/// Called by: Root.type (S0.3); ConjugationService's router and `ENGINE_BACKING`
/// (S0.5), which key on it; every verb type's engine (S0.8 onward); WordSpec
/// (SarfQuiz, S2.1), which stores it.
public enum VerbType: String, CaseIterable, Codable, Sendable {
    case salim, mahmuz, mudaaf
    case mithalWaw = "mithal_waw", mithalYa = "mithal_ya"
    case ajwafWaw = "ajwaf_waw", ajwafYa = "ajwaf_ya"
    case naqisWaw = "naqis_waw", naqisYa = "naqis_ya"
    case lafifMafruq = "lafif_mafruq", lafifMaqrun = "lafif_maqrun"

    /// The name the student sees — declared per case, not derived from the raw
    /// value's prefix, so a new type cannot be grouped by accident.
    public var group: VerbTypeGroup {
        switch self {
        case .salim:       return .salim
        case .mahmuz:      return .mahmuz
        case .mudaaf:      return .mudaaf
        case .mithalWaw, .mithalYa: return .mithal
        case .ajwafWaw, .ajwafYa:   return .ajwaf
        case .naqisWaw, .naqisYa:   return .naqis
        case .lafifMafruq, .lafifMaqrun: return .lafif
        }
    }
}

/// What a student picks: one per traditional type name, so mithāl is one chip
/// covering `mithalWaw` and `mithalYa`.
///
/// DELIBERATELY NOT `Codable`. The rule is "expand at the UI boundary, store the
/// granular one": carrying a group name into plan data silently killed a Home
/// drill in the prototype, because the engine routes on `VerbType` and a group
/// name is not one. Leaving the conformance off makes that a compile error
/// instead of a bug. If a persisted draft ever needs to remember a chip
/// selection, add it then, as a visible diff, and store `verbTypes` instead.
///
/// Called by: Settings' feature gates and Practice's chips (S1.1, S5);
/// Glossary (SarfQuiz) for the display label; `Lexicon.availableTypes` (S0.3).
public enum VerbTypeGroup: String, CaseIterable, Sendable {
    case salim, mahmuz, mudaaf, mithal, ajwaf, naqis, lafif

    /// The engine types this chip covers — the inverse of `VerbType.group`,
    /// derived from it so the two cannot disagree.
    public var verbTypes: [VerbType] {
        VerbType.allCases.filter { $0.group == self }
    }
}
