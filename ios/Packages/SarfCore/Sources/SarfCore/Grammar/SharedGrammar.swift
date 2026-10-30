// Grammar facts that hold for every verb type.

/// What is true of a form whatever the verb type.
struct FormFacts {
    /// False only for Form IX, which is shown for recognition and has no
    /// conjugation yet.
    let isConjugable: Bool

    /// Whether the form has a passive. Form VII doesn't: it never takes an object.
    let hasMajhul: Bool
}

extension VerbForm {
    /// Used by: ConjugationService (`conjugates`, `hasPassive`).
    var facts: FormFacts {
        switch self {
        case .i:    return FormFacts(isConjugable: true,  hasMajhul: true)
        case .ii:   return FormFacts(isConjugable: true,  hasMajhul: true)
        case .iii:  return FormFacts(isConjugable: true,  hasMajhul: true)
        case .iv:   return FormFacts(isConjugable: true,  hasMajhul: true)
        case .v:    return FormFacts(isConjugable: true,  hasMajhul: true)
        case .vi:   return FormFacts(isConjugable: true,  hasMajhul: true)
        case .vii:  return FormFacts(isConjugable: true,  hasMajhul: false)
        case .viii: return FormFacts(isConjugable: true,  hasMajhul: true)
        case .ix:   return FormFacts(isConjugable: false, hasMajhul: false)
        case .x:    return FormFacts(isConjugable: true,  hasMajhul: true)
        }
    }
}

/// First letters that swallow Form VIII's infixed taa:
///
///     دعو  →  اِدَّعَى      not  اِدْتَعَى
///     ضرب  →  اِضْطَرَبَ    not  اِضْتَرَبَ
///
/// No engine does this substitution yet, so ConjugationService answers nil for
/// these roots in Form VIII rather than build a word nobody says.
///
/// Used by: ConjugationService (`chartExists`, `derivedNoun`).
let iftiaalAssimilatingFaa: Set<Unicode.Scalar> = ["د", "ذ", "ز", "ص", "ض", "ط", "ظ"]
