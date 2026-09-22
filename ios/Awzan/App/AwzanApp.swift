// Awzan — أوزان, "patterns". The app target.
//
// Thin by design: every piece of domain logic lives in the two local packages
// (SarfCore, SarfQuiz) and the app never reaches around them. What is here is
// UI and platform services only — see TECHNICAL_PLAN §B.2.
//
// Nothing but the design system exists yet. Track D built the token layer and
// the components Tables needs; E1 brings the engine and the real Tables screen,
// and this file gains AppModel — the composition root — with it.

import SwiftUI

@main
struct AwzanApp: App {
    init() {
        // A custom font that failed to register does not throw: UIFont(name:)
        // answers a system fallback and every Arabic word renders in Helvetica
        // with its ḥarakāt in the wrong places. That reads as a design mistake,
        // not a missing file, so say it out loud in debug builds.
        assert(
            MidadFonts.missing().isEmpty,
            "Bundled fonts did not register: \(MidadFonts.missing()). "
                + "Check UIAppFonts in Info.plist against Resources/Fonts."
        )
    }

    var body: some Scene {
        WindowGroup {
            DesignSystemGallery()
        }
    }
}
