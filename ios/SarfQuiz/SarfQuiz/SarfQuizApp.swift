// App entry point. All sarf logic lives in the SarfCore package — the app
// target only draws and routes, exactly like the web prototype's app.js.

import SwiftUI

@main
struct SarfQuizApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
        }
    }
}

/// Home is always at the root; a running quiz covers it full-screen and
/// dismissing the cover (quit or "Back to quizzes") returns home.
struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        @Bindable var model = model
        HomeView()
            .fullScreenCover(item: $model.run) { run in
                QuizView(run: run)
            }
    }
}
