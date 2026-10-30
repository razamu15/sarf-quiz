// Which held-back verb types the settings have released.

import SarfCore

extension ContentGate {
    /// The gate as the settings currently say. Settings name them `mahmuzVerbs`
    /// and `lafifVerbs` because a setting's name is saved and can never change;
    /// the gate names the group. This is the only place the two meet.
    ///
    /// Used by: the app root, to work out which verb types are playable.
    @MainActor
    init(from settings: Settings) {
        self.init(mahmuz: settings[.mahmuzVerbs], lafif: settings[.lafifVerbs])
    }
}
