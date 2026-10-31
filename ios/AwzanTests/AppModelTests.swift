// The app's shared model: the verbs it loads, which types are playable, and the
// tabs. Nothing here draws anything.

import Foundation
import SarfCore
import SwiftUI
import Synchronization
import Testing
@testable import Awzan

/// Each test gets its own empty settings storage, deleted afterwards.
@MainActor
final class AppModelTests {
    private let storageName = "AppModelTests-\(UUID().uuidString)"
    private let defaults: UserDefaults

    init() throws {
        defaults = try #require(UserDefaults(suiteName: storageName))
    }

    deinit {
        UserDefaults.standard.removePersistentDomain(forName: storageName)
    }

    private func loadModel() throws -> AppModel {
        try AppModel.load(settings: Settings(defaults: defaults))
    }

    // MARK: Tabs

    @Test func fourTabsInTheOrderTheBarShowsThem() {
        #expect(AppTab.allCases == [.home, .practice, .tables, .more])
        #expect(AppTab.allCases.map(\.title) == ["Home", "Practice", "Tables", "More"])
        #expect(AppTab.allCases.map(\.systemImage) == ["house", "slider.horizontal.3", "tablecells", "ellipsis.circle"])
    }

    @Test func startsOnHome() throws {
        #expect(try loadModel().selectedTab == .home)
    }

    @Test func appearanceBecomesAColourScheme() {
        #expect(Appearance.system.colorScheme == nil)
        #expect(Appearance.paper.colorScheme == .light)
        #expect(Appearance.night.colorScheme == .dark)
    }

    // MARK: Loading

    /// The lexicon and the service came from the same files, so a root of the
    /// lexicon gets its words from the service.
    @Test func loadsTheLexiconAndTheServiceTogether() throws {
        let model = try loadModel()
        let katab = try #require(model.lexicon.root(forKey: "كتب"))
        #expect(model.conjugation.citation(katab, form: .i) == "كَتَبَ يَكْتُبُ")
    }

    @Test func theModelKeepsTheSettingsItWasGiven() throws {
        let settings = Settings(defaults: defaults)
        let model = try AppModel.load(settings: settings)
        settings[.appearance] = .night
        #expect(model.settings[.appearance] == .night)
    }

    // MARK: Playable types

    private func groups(of types: [VerbType]) -> Set<VerbTypeGroup> {
        Set(types.map(\.group))
    }

    /// Mahmūz and lafīf are held back, so what is left is the other five.
    @Test func mahmuzAndLafifAreHeldBackAtFirst() throws {
        let model = try loadModel()
        #expect(groups(of: model.playableTypes) == [.salim, .mudaaf, .mithal, .ajwaf, .naqis])
    }

    @Test func releasingMahmuzAddsItsTypesAndNothingElse() throws {
        let model = try loadModel()
        let before = model.playableTypes
        model.settings[.mahmuzVerbs] = true
        let added = model.playableTypes.filter { !before.contains($0) }
        #expect(!added.isEmpty)
        #expect(groups(of: added) == [.mahmuz])
        #expect(before.allSatisfy { model.playableTypes.contains($0) })
    }

    /// Lafīf has roots but no engine, so releasing it adds nothing. This is the
    /// test to change when the lafīf engine is written.
    @Test func releasingLafifAddsNothingWhileItHasNoEngine() throws {
        let model = try loadModel()
        let before = model.playableTypes
        model.settings[.lafifVerbs] = true
        #expect(model.playableTypes == before)
    }

    /// Tables searches the roots of these types. They are every root except the
    /// held-back groups' (136 of 166 when this was written), however the engines
    /// and the gate get there.
    @Test func theRootsOfThePlayableTypes() throws {
        let model = try loadModel()
        let playable = model.lexicon.roots.filter { model.playableTypes.contains($0.verbType) }
        let notHeldBack = model.lexicon.roots.filter { $0.verbType.group != .mahmuz && $0.verbType.group != .lafif }
        #expect(!playable.isEmpty)
        #expect(playable == notHeldBack)
    }

    /// A screen that reads the list is redrawn when a flag changes it.
    @Test func aChangeToTheListIsSeenByWhoeverReadIt() throws {
        let model = try loadModel()
        let changed = Mutex(false)
        withObservationTracking {
            _ = model.playableTypes
        } onChange: {
            changed.withLock { $0 = true }
        }
        model.settings[.mahmuzVerbs] = true
        #expect(changed.withLock { $0 })
    }

    // MARK: Tables

    /// The Tables search lists what the app says is playable, and follows a switch.
    @Test func theTablesSearchFollowsTheContentSwitches() throws {
        let model = try loadModel()
        let held: Set<VerbTypeGroup> = [.mahmuz, .lafif]
        #expect(model.tables.results.count == model.lexicon.roots.filter { !held.contains($0.verbType.group) }.count)
        model.settings[.mahmuzVerbs] = true
        #expect(model.tables.results.count == 151)
    }

    @Test func theTablesChoiceLastsWhileTheAppIsOpen() throws {
        let model = try loadModel()
        let row = try #require(model.tables.results.first { $0.root.key == "نصر" })
        model.tables.choose(row)
        model.selectedTab = .home
        model.selectedTab = .tables
        #expect(model.tables.chosen?.root.key == "نصر")
    }
}
