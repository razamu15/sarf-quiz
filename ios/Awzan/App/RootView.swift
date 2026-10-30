// The main screen: four tabs.

import SwiftUI

/// The tab bar and what each tab shows. Also applies the appearance setting, so
/// every screen below follows it.
///
/// Used by: AppRoot.
struct RootView: View {
    let model: AppModel

    var body: some View {
        @Bindable var model = model
        TabView(selection: $model.selectedTab) {
            ForEach(AppTab.allCases, id: \.self) { tab in
                Tab(tab.title, systemImage: tab.systemImage, value: tab) {
                    EmptyTab(title: tab.title)
                        .toolbarBackground(Midad.raised, for: .tabBar)
                        .toolbarBackgroundVisibility(.visible, for: .tabBar)
                }
            }
        }
        .tint(Midad.ink)
        .preferredColorScheme(model.settings[.appearance].colorScheme)
    }
}

/// Stands in for a tab's screen until it is built.
private struct EmptyTab: View {
    let title: String

    var body: some View {
        VStack(spacing: Midad.space2) {
            Text(title)
                .typeStyle(.screenTitle)
                .foregroundStyle(Midad.ink)
            Text("Not built yet")
                .typeStyle(.caption)
                .foregroundStyle(Midad.inkFaint)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Midad.ground)
    }
}

#Preview("Paper") {
    RootView(model: try! AppModel.load())
}

#Preview("Night") {
    RootView(model: try! AppModel.load())
        .preferredColorScheme(.dark)
}
