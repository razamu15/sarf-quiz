// Verb types, at two levels:
//
//   VerbType        what the engine uses, and what is saved
//   VerbTypeGroup   what a student picks in the UI
//
// For example, "Mithal" is one group but two engine types: mithalWaw and
// mithalYa.

/// A verb type as the engine sees it. Verbs with a weak letter (و or ي) are split
/// by which letter it is, because the two conjugate differently:
///
///     وَعَدَ   mithalWaw
///     يَبِسَ   mithalYa
///
/// Lafif (two weak letters) is split by where they sit instead: mafruq, with a
/// strong letter between them (وَقَى), or maqrun, side by side (طَوَى).
///
/// Used by: Root, ConjugationService, every engine, saved quiz words.
public enum VerbType: String, CaseIterable, Codable, Sendable {
    case salim, mahmuz, mudaaf
    case mithalWaw = "mithal_waw", mithalYa = "mithal_ya"
    case ajwafWaw = "ajwaf_waw", ajwafYa = "ajwaf_ya"
    case naqisWaw = "naqis_waw", naqisYa = "naqis_ya"
    case lafifMafruq = "lafif_mafruq", lafifMaqrun = "lafif_maqrun"

    /// The group a student sees this type under.
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

/// What a student picks: one name per traditional verb type, so "Mithal" covers
/// both mithalWaw and mithalYa.
///
/// Not Codable on purpose. Saved data and quiz plans must hold `VerbType`s, so
/// use `verbTypes` to convert.
///
/// Used by: the feature gates, the Practice chips, the glossary.
public enum VerbTypeGroup: String, CaseIterable, Sendable {
    case salim, mahmuz, mudaaf, mithal, ajwaf, naqis, lafif

    /// The engine types in this group.
    public var verbTypes: [VerbType] {
        VerbType.allCases.filter { $0.group == self }
    }
}
