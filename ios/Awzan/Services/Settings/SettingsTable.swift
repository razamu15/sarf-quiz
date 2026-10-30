// Every setting in the app, in one place. Adding one is a case in `SettingID`,
// a row here, and a line in `Settings.entries`.

extension Setting where Value == Bool {
    // Developer levers. All off in this version, except compareCharts.

    /// Later version.
    static var aiExplain: Self {
        Setting(id: .aiExplain, audience: .dev, initial: false, label: "AI explanations")
    }

    /// Turns the stats screens on or off. Nothing that records history reads it.
    static var detailedStats: Self {
        Setting(id: .detailedStats, audience: .dev, initial: false, label: "Detailed stats")
    }

    /// On for us, off for users: it is how we check the engines.
    static var compareCharts: Self {
        Setting(id: .compareCharts, audience: .dev, initial: true, label: "Compare charts")
    }

    /// No paid tier in this version.
    static var monetization: Self {
        Setting(id: .monetization, audience: .dev, initial: false, label: "Subscription")
    }

    /// Lets mahmūz verbs into the quiz.
    static var mahmuzVerbs: Self {
        Setting(id: .mahmuzVerbs, audience: .dev, initial: false, label: "Mahmūz verbs")
    }

    /// Lets lafīf verbs into the quiz.
    static var lafifVerbs: Self {
        Setting(id: .lafifVerbs, audience: .dev, initial: false, label: "Lafīf verbs")
    }
}

extension Setting where Value == Appearance {
    static var appearance: Self {
        Setting(id: .appearance, audience: .user, initial: .system, label: "Appearance")
    }
}

extension Setting where Value == QuizLengthChoice {
    static var defaultQuizLength: Self {
        Setting(id: .defaultQuizLength, audience: .user, initial: .ten, label: "Default quiz length")
    }
}
