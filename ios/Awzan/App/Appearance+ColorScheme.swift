// How the appearance setting becomes a colour scheme.

import SwiftUI

extension Appearance {
    /// Nil leaves the choice to the phone.
    ///
    ///     .night   →   .dark
    ///
    /// Used by: RootView.
    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .paper:  return .light
        case .night:  return .dark
        }
    }
}
