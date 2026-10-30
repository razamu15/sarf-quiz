// Awzan (أوزان, "patterns"): the app target. It holds UI and platform code only;
// the logic lives in the SarfCore and SarfQuiz packages.

import SwiftUI

@main
struct AwzanApp: App {
    private let startup: Result<AppModel, Error>

    init() {
        // A font that fails to load doesn't crash; the Arabic just renders in
        // Helvetica. This catches it in debug builds.
        assert(
            MidadFonts.missing().isEmpty,
            "Bundled fonts did not register: \(MidadFonts.missing()). "
                + "Check UIAppFonts in Info.plist against Resources/Fonts."
        )
        startup = Result { try AppModel.load() }
    }

    var body: some Scene {
        WindowGroup {
            AppRoot(startup: startup)
        }
    }
}
