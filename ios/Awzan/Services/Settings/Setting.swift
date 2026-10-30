// What a setting is. The settings themselves are listed in SettingsTable.swift.

/// A setting's name in storage. A saved value is filed under it, so never rename one.
enum SettingID: String, CaseIterable, Sendable {
    case aiExplain
    case detailedStats
    case compareCharts
    case monetization
    case mahmuzVerbs
    case lafifVerbs
    case appearance
    case defaultQuizLength
}

/// Who a setting is for. `dev` levers are flipped by us and never shown in
/// Settings; `user` preferences are what the Settings screen lists.
enum SettingAudience: Sendable {
    case dev
    case user
}

/// A kind of value a setting can hold, and how it is written to storage.
/// Anything with a `String` raw value gets this for free.
protocol SettingChoice: Sendable, Hashable {
    init?(stored: String)
    var stored: String { get }
}

extension SettingChoice where Self: RawRepresentable, RawValue == String {
    init?(stored: String) { self.init(rawValue: stored) }
    var stored: String { rawValue }
}

extension Bool: SettingChoice {
    init?(stored: String) { self.init(stored) }
    var stored: String { description }
}

/// The part of a setting that doesn't depend on its value, so settings holding
/// different kinds of value can sit in one list.
protocol SettingEntry: Sendable {
    var id: SettingID { get }
    var audience: SettingAudience { get }
    var label: String { get }
}

/// One setting. Read and written as `settings[.compareCharts]`, which has the
/// type of the setting's value.
///
///     Setting(id: .appearance, audience: .user, initial: Appearance.system, label: "Appearance")
///
/// Used by: Settings, and SettingsTable (which declares them all).
struct Setting<Value: SettingChoice>: SettingEntry {
    let id: SettingID
    let audience: SettingAudience
    /// What it reads as until it is changed.
    let initial: Value
    /// The name the Settings screen (`user`) or the debug screen (`dev`) shows.
    let label: String
}
