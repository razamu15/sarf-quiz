// The first thing on screen: the app, or why it could not start.

import SarfCore
import SwiftUI

/// Shows the tabs once the verbs have loaded, and the reason if they did not.
///
/// In a debug build, setting `AWZAN_GALLERY` shows a gallery instead:
/// `tables` is the Tables sections in every state, anything else is the
/// design-system gallery (see DesignSystemGallery).
///
/// Used by: AwzanApp.
struct AppRoot: View {
    let startup: Result<AppModel, Error>

    var body: some View {
        #if DEBUG
        switch ProcessInfo.processInfo.environment["AWZAN_GALLERY"] {
        case nil: content
        case "tables": TablesSectionsGallery()
        default: DesignSystemGallery()
        }
        #else
        content
        #endif
    }

    @ViewBuilder
    private var content: some View {
        switch startup {
        case .success(let model): RootView(model: model)
        case .failure(let error): StartupFailureView(error: error)
        }
    }
}

/// What a build with a bad lexicon or corpus shows. The text is the error as
/// the loader wrote it, so a wrong file can be named from a screenshot.
///
/// Used by: AppRoot.
private struct StartupFailureView: View {
    let error: Error

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Midad.space3) {
                Text("The verbs did not load")
                    .typeStyle(.screenTitle)
                    .foregroundStyle(Midad.ink)
                Text(String(describing: error))
                    .typeStyle(.body)
                    .foregroundStyle(Midad.ink)
                    .textSelection(.enabled)
            }
            .padding(Midad.space4)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Midad.ground)
    }
}

#Preview("Failed") {
    AppRoot(startup: .failure(LexiconError.duplicateRoot("كتب")))
}
