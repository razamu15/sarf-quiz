// Awzan (أوزان, "patterns"): the app target. It holds UI and platform code only;
// the logic lives in the SarfCore and SarfQuiz packages. For now it only shows
// the design-system gallery.

import SwiftUI

@main
struct AwzanApp: App {
    init() {
        // A font that fails to load doesn't crash; the Arabic just renders in
        // Helvetica. This catches it in debug builds.
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
