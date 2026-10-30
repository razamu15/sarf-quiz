// The settings: what they start as, what is saved, and what the content gate
// makes of them. Nothing here draws anything.

import Foundation
import SarfCore
import Synchronization
import Testing
@testable import Awzan

/// Each test gets its own empty storage, deleted afterwards.
@MainActor
final class SettingsTests {
    private let storageName = "SettingsTests-\(UUID().uuidString)"
    private let defaults: UserDefaults

    init() throws {
        defaults = try #require(UserDefaults(suiteName: storageName))
    }

    deinit {
        UserDefaults.standard.removePersistentDomain(forName: storageName)
    }

    /// What is on disk: the saved values by name.
    private func onDisk() -> [String: String]? {
        defaults.dictionary(forKey: "settings.v1") as? [String: String]
    }

    // MARK: Names

    /// Names and choices are written to storage, so each is pinned as a literal.
    @Test func storedNamesArePinned() {
        #expect(SettingID.allCases.map(\.rawValue) == [
            "aiExplain", "detailedStats", "compareCharts", "monetization",
            "mahmuzVerbs", "lafifVerbs", "appearance", "defaultQuizLength",
        ])
        #expect(Appearance.allCases.map(\.rawValue) == ["system", "paper", "night"])
        #expect(QuizLengthChoice.allCases.map(\.rawValue) == ["five", "ten", "twenty", "endless"])
    }

    @Test func everySettingIsListedOnce() {
        #expect(Settings.entries.map(\.id.rawValue).sorted() == SettingID.allCases.map(\.rawValue).sorted())
        #expect(Settings.entries.allSatisfy { !$0.label.isEmpty })
    }

    /// Settings lists the `user` ones and nothing else.
    @Test func twoAreForUsersTheRestAreLevers() {
        #expect(Settings.entries.filter { $0.audience == .user }.map(\.id) == [.appearance, .defaultQuizLength])
        #expect(Settings.entries.filter { $0.audience == .dev }.map(\.id) == [
            .aiExplain, .detailedStats, .compareCharts, .monetization, .mahmuzVerbs, .lafifVerbs,
        ])
    }

    // MARK: Starting values

    /// Written out here, not read from the table, so a wrong row shows.
    @Test func eachSettingStartsAsShipped() {
        let settings = Settings(defaults: defaults)
        #expect(settings[.aiExplain] == false)
        #expect(settings[.detailedStats] == false)
        #expect(settings[.compareCharts] == true)
        #expect(settings[.monetization] == false)
        #expect(settings[.mahmuzVerbs] == false)
        #expect(settings[.lafifVerbs] == false)
        #expect(settings[.appearance] == .system)
        #expect(settings[.defaultQuizLength] == .ten)
    }

    @Test func quizLengthsCountQuestions() {
        #expect(QuizLengthChoice.five.questionCount == 5)
        #expect(QuizLengthChoice.ten.questionCount == 10)
        #expect(QuizLengthChoice.twenty.questionCount == 20)
        #expect(QuizLengthChoice.endless.questionCount == nil)
    }

    // MARK: Saving

    @Test func aChangeSurvivesARelaunch() {
        let first = Settings(defaults: defaults)
        first[.compareCharts] = false
        first[.appearance] = .night
        first[.defaultQuizLength] = .endless

        let second = Settings(defaults: defaults)
        #expect(second[.compareCharts] == false)
        #expect(second[.appearance] == .night)
        #expect(second[.defaultQuizLength] == .endless)
        #expect(second[.mahmuzVerbs] == false)
    }

    @Test func everyChoiceCanBeWrittenAndReadBack() {
        for value in [true, false] { #expect(Bool(stored: value.stored) == value) }
        for value in Appearance.allCases { #expect(Appearance(stored: value.stored) == value) }
        for value in QuizLengthChoice.allCases { #expect(QuizLengthChoice(stored: value.stored) == value) }
    }

    /// Setting a value back to what it started as leaves nothing saved.
    @Test func onlyDifferencesAreSaved() {
        let settings = Settings(defaults: defaults)
        #expect(onDisk() == nil)

        settings[.appearance] = .night
        #expect(onDisk() == ["appearance": "night"])

        settings[.appearance] = .system
        #expect(onDisk() == [:])
    }

    /// `practiceFlow` was a setting once. Its saved value must not come back.
    @Test func aNameThatIsNoLongerASettingIsDropped() {
        defaults.set(["practiceFlow": "wizard", "appearance": "night"], forKey: "settings.v1")
        let settings = Settings(defaults: defaults)
        #expect(settings[.appearance] == .night)

        settings[.defaultQuizLength] = .five
        #expect(onDisk() == ["appearance": "night", "defaultQuizLength": "five"])
    }

    @Test func aSavedValueThatIsNotAnOptionReadsAsUnset() {
        defaults.set(["appearance": "sepia", "compareCharts": "maybe"], forKey: "settings.v1")
        let settings = Settings(defaults: defaults)
        #expect(settings[.appearance] == .system)
        #expect(settings[.compareCharts] == true)
    }

    // MARK: Watching

    /// A screen that reads a setting is redrawn when it changes.
    @Test func aChangeIsSeenByWhoeverReadIt() {
        let settings = Settings(defaults: defaults)
        let changed = Mutex(false)
        withObservationTracking {
            _ = settings[.appearance]
        } onChange: {
            changed.withLock { $0 = true }
        }
        settings[.appearance] = .night
        #expect(changed.withLock { $0 })
    }

    // MARK: The content gate

    @Test func theGateStartsClosed() {
        let settings = Settings(defaults: defaults)
        #expect(ContentGate(from: settings) == ContentGate(mahmuz: false, lafif: false))
    }

    /// Each flag opens its own group and not the other.
    @Test func eachFlagOpensItsOwnGroup() {
        let settings = Settings(defaults: defaults)
        settings[.mahmuzVerbs] = true
        #expect(ContentGate(from: settings) == ContentGate(mahmuz: true, lafif: false))

        settings[.mahmuzVerbs] = false
        settings[.lafifVerbs] = true
        #expect(ContentGate(from: settings) == ContentGate(mahmuz: false, lafif: true))
    }
}
