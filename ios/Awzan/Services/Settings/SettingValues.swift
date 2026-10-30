// The kinds of value a setting holds, other than on/off.

/// Whether the app follows the phone's light or dark setting, or is always
/// Paper (light) or Night (dark).
///
/// Used by: the appearance setting.
enum Appearance: String, CaseIterable, SettingChoice {
    case system
    case paper
    case night
}

/// The quiz lengths Settings offers.
///
///     .twenty   →   20 questions
///     .endless  →   no end
///
/// Used by: the default quiz length setting.
enum QuizLengthChoice: String, CaseIterable, SettingChoice {
    case five
    case ten
    case twenty
    case endless

    /// How many questions. Nil when it never ends.
    var questionCount: Int? {
        switch self {
        case .five:    return 5
        case .ten:     return 10
        case .twenty:  return 20
        case .endless: return nil
        }
    }
}
