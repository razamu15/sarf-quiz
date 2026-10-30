// The app's four tabs.

/// A tab of the main screen, in the order the tab bar shows them.
///
/// Used by: AppModel (which one is selected), RootView.
enum AppTab: CaseIterable, Hashable, Sendable {
    case home
    case practice
    case tables
    case more

    var title: String {
        switch self {
        case .home:     return "Home"
        case .practice: return "Practice"
        case .tables:   return "Tables"
        case .more:     return "More"
        }
    }

    /// The SF Symbol drawn above the title.
    var systemImage: String {
        switch self {
        case .home:     return "house"
        case .practice: return "slider.horizontal.3"
        case .tables:   return "tablecells"
        case .more:     return "ellipsis.circle"
        }
    }
}
