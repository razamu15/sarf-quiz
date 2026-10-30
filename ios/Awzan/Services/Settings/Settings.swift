// The app's settings, saved on the device.

import Foundation
import Observation

/// Reads and writes settings, and keeps what was changed.
///
///     settings[.compareCharts]            →   true
///     settings[.appearance] = .night      // saved; read back after a relaunch
///
/// Only values that differ from the setting's initial are saved. A saved value
/// that is not one of the setting's options reads as if never set.
///
/// Used by: the app root (one, shared by every screen).
@MainActor @Observable
final class Settings {
    /// Every setting, in the order the debug and Settings screens list them.
    static let entries: [any SettingEntry] = [
        Setting<Bool>.aiExplain,
        Setting<Bool>.detailedStats,
        Setting<Bool>.compareCharts,
        Setting<Bool>.monetization,
        Setting<Bool>.mahmuzVerbs,
        Setting<Bool>.lafifVerbs,
        Setting<Appearance>.appearance,
        Setting<QuizLengthChoice>.defaultQuizLength,
    ]

    private static let storageKey = "settings.v1"

    private let defaults: UserDefaults
    /// The saved values that differ from the initial, as written to storage.
    private var saved: [SettingID: String]

    /// Names in storage that are no longer settings are dropped here, so they
    /// don't come back as a setting nobody can see.
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let stored = defaults.dictionary(forKey: Self.storageKey) as? [String: String] ?? [:]
        saved = Dictionary(uniqueKeysWithValues: stored.compactMap { name, value in
            SettingID(rawValue: name).map { ($0, value) }
        })
    }

    subscript<Value: SettingChoice>(setting: Setting<Value>) -> Value {
        get { saved[setting.id].flatMap(Value.init(stored:)) ?? setting.initial }
        set {
            saved[setting.id] = newValue == setting.initial ? nil : newValue.stored
            defaults.set(
                Dictionary(uniqueKeysWithValues: saved.map { ($0.key.rawValue, $0.value) }),
                forKey: Self.storageKey)
        }
    }
}
