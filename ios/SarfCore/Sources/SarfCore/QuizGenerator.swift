// Quiz generation. Two entry points:
//
//   customQuiz(settings:)          user-picked categories × forms × verb types
//   simpleQuiz(preset:)            drills: N words × 3 questions per word
//                                  (tense → maʿlūm/majhūl → pronoun)
//
// Every question ships with a generic gloss (shown before answering), a
// contextual meaning (shown after), a rule-based explanation line, and the
// full morphological facts for the AI Explain feature.

import Foundation

// MARK: - Question model

/// One answer choice: Arabic text plus an English sub-label (either may be
/// empty depending on the question type).
public struct AnswerOption: Equatable {
    public let arabic: String
    public let english: String
}

/// Everything the AI Explain feature needs to teach this word — the engine
/// knows all of it at generation time, so the model never has to derive facts.
public struct ExplainPayload: Codable, Equatable {
    public let word: String
    public let rootLetters: String
    public let form: FormID
    public let bab: Bab?
    public let tense: Tense?
    public let voice: Voice?
    public let mood: Mood?
    public let slot: PronounSlot?
    public let wazn: String?
    public let gloss: String
}

public struct Question {
    public let category: QuestionCategory
    public let formID: FormID
    public let word: String              // what's shown on the card
    public let gloss: String             // generic meaning, shown BEFORE answering
    public let fullMeaning: String       // contextual meaning, shown AFTER
    public let prompt: String
    public let options: [AnswerOption]
    public let correctIndex: Int
    public let explanation: String       // rule-based one-liner
    public let explainPayload: ExplainPayload
    public var bundleTag: String?        // "Word 2 / 5" in drills
}

/// Custom-quiz configuration (mirrors the prototype's settings screen).
public struct QuizSettings {
    public var categories: [QuestionCategory]
    public var forms: [FormID]
    public var verbTypes: [VerbType]
    public var questionCount: Int

    public init(categories: [QuestionCategory], forms: [FormID], verbTypes: [VerbType], questionCount: Int) {
        self.categories = categories
        self.forms = forms
        self.verbTypes = verbTypes
        self.questionCount = questionCount
    }
}

/// A ready-to-go drill: fixed scope, no configuration.
public struct DrillPreset {
    public let id: String
    public let title: String
    public let arabicTitle: String
    public let detail: String
    public let verbTypes: [VerbType]?    // nil = every type that has content
    public let forms: [FormID]

    /// The Form I (mujarrad) drills, one per verb type plus a mix.
    public static let formOneDrills: [DrillPreset] = [
        DrillPreset(id: "salim", title: "Sound verbs", arabicTitle: "سَالِم",
                    detail: "No weak letters — the foundation.",
                    verbTypes: [.salim], forms: [.I]),
        DrillPreset(id: "ajwaf", title: "Hollow verbs", arabicTitle: "أَجْوَف",
                    detail: "Weak middle radical, like قَالَ.",
                    verbTypes: [.ajwaf], forms: [.I]),
        DrillPreset(id: "naqis", title: "Defective verbs", arabicTitle: "نَاقِص",
                    detail: "Weak final radical, like رَمَى.",
                    verbTypes: [.naqis], forms: [.I]),
        DrillPreset(id: "mudaaf", title: "Doubled verbs", arabicTitle: "مُضَاعَف",
                    detail: "Doubled radical, like مَدَّ.",
                    verbTypes: [.mudaaf], forms: [.I]),
        DrillPreset(id: "mixed", title: "Everything mix", arabicTitle: "مُنَوَّع",
                    detail: "All verb types with content, shuffled together.",
                    verbTypes: nil, forms: [.I]),
    ]
}

// MARK: - QuizGenerator

public struct QuizGenerator {
    public static let wordsPerDrill = 5

    private let content: ContentStore
    private let conjugator: Conjugator
    private let meanings: MeaningRenderer
    private var grammar: GrammarTables { content.grammar }

    public init(content: ContentStore) {
        self.content = content
        self.conjugator = Conjugator(grammar: content.grammar)
        self.meanings = MeaningRenderer(grammar: content.grammar)
    }

    // MARK: Drill presets

    public func mazeedDrill(for form: FormID) -> DrillPreset {
        let spec = grammar.form(form)
        return DrillPreset(
            id: "form-\(form.rawValue)",
            title: spec.nameEn,
            arabicTitle: spec.name,
            detail: conjugator.waznCitation(form),
            verbTypes: nil,
            forms: [form]
        )
    }

    /// A drill is available when at least one selected verb type has content
    /// and at least one selected form is conjugable with a root using it.
    public func isDrillAvailable(_ preset: DrillPreset) -> Bool {
        let wantedTypes = preset.verbTypes ?? Array(content.availableVerbTypes)
        guard wantedTypes.contains(where: content.availableVerbTypes.contains) else { return false }
        return preset.forms.contains { form in
            grammar.form(form).conjugable
                && content.roots.contains { $0.entry(for: form) != nil }
        }
    }

    // MARK: Custom quiz

    public func customQuiz(settings: QuizSettings) -> [Question] {
        let categories = settings.categories.isEmpty ? QuestionCategory.allCases : settings.categories
        var questions: [Question] = []
        var seenKeys = Set<String>()

        // Builders are probabilistic (random word, then feasibility checks),
        // so over-iterate with a guard rather than assuming every attempt lands.
        var attempts = 0
        while questions.count < settings.questionCount && attempts < settings.questionCount * 30 {
            attempts += 1
            guard let category = categories.randomElement(),
                  let question = buildQuestion(category: category, settings: settings)
            else { continue }
            let key = "\(question.category.rawValue)|\(question.word)|\(question.prompt)"
            guard seenKeys.insert(key).inserted else { continue }
            questions.append(question)
        }
        return questions
    }

    // MARK: Drill quiz (N words × 3 questions)

    /// Words are restricted to māḍī/muḍāriʿ. A word is only shown in majhūl
    /// when both voices exist (so the voice question is never a giveaway);
    /// a word with no majhūl at all (lāzim) gets a wazn question instead.
    public func simpleQuiz(preset: DrillPreset, wordCount: Int = QuizGenerator.wordsPerDrill) -> [Question] {
        let settings = QuizSettings(
            categories: [],
            forms: preset.forms,
            verbTypes: preset.verbTypes ?? Array(content.availableVerbTypes),
            questionCount: 0
        )

        // Pick distinct words.
        var words: [ConjugatedWord] = []
        var seenWords = Set<String>()
        var attempts = 0
        while words.count < wordCount && attempts < 400 {
            attempts += 1
            guard var verb = randomVerb(settings: settings, tenses: [.madi, .mudari], voices: [.malum]) else { break }
            let majhulWord = conjugator.conjugate(
                verb.root, form: verb.form, tense: verb.tense, voice: .majhul, slot: verb.slot)
            verb.hasVoicePair = majhulWord != nil
            if let majhulWord, Bool.random() {
                verb.voice = .majhul
                verb.word = majhulWord
            }
            guard seenWords.insert(verb.word).inserted else { continue }
            words.append(verb)
        }

        // Three questions per word, carrying a "Word i / n" tag.
        var questions: [Question] = []
        for (index, verb) in words.enumerated() {
            let tag = "Word \(index + 1) / \(words.count)"
            let second = verb.hasVoicePair ? voiceQuestion(for: verb) : waznQuestion(for: verb)
            for var question in [tenseQuestion(for: verb), second, doerQuestion(for: verb)].compactMap({ $0 }) {
                question.bundleTag = tag
                questions.append(question)
            }
        }
        return questions
    }

    // MARK: - Word selection

    /// A conjugated word together with every fact used to build questions
    /// about it.
    private struct ConjugatedWord {
        let root: Root
        let form: FormID
        var tense: Tense
        var voice: Voice
        let slot: PronounSlot
        var word: String
        var hasVoicePair: Bool = false
    }

    private struct Candidate {
        let root: Root
        let form: FormID
    }

    private func candidates(matching settings: QuizSettings) -> [Candidate] {
        content.roots.flatMap { root -> [Candidate] in
            guard settings.verbTypes.contains(root.type) else { return [] }
            return root.availableForms
                .filter { settings.forms.contains($0) }
                .map { Candidate(root: root, form: $0) }
        }
    }

    /// A candidate can yield conjugated words if the engine handles it or it
    /// carries hand-authored tables.
    private func conjugatableCandidates(matching settings: QuizSettings) -> [Candidate] {
        candidates(matching: settings).filter {
            grammar.form($0.form).conjugable || ($0.root.entry(for: $0.form)?.hasOverrideTables ?? false)
        }
    }

    /// Random conjugated word matching the settings; retries because a random
    /// (candidate, tense, voice, slot) pick may not exist (missing majhūl,
    /// missing irregular table, …).
    private func randomVerb(
        settings: QuizSettings,
        tenses: [Tense] = [.madi, .mudari, .amr],
        voices: [Voice] = [.malum, .majhul]
    ) -> ConjugatedWord? {
        let pool = conjugatableCandidates(matching: settings)
        guard !pool.isEmpty else { return nil }
        for _ in 0..<80 {
            let candidate = pool.randomElement()!
            let tense = tenses.randomElement()!
            let voice = tense == .amr ? .malum : voices.randomElement()!
            let slot = (tense == .amr ? grammar.amrOnlySlots : grammar.allSlots).randomElement()!
            if let word = conjugator.conjugate(candidate.root, form: candidate.form, tense: tense, voice: voice, slot: slot) {
                return ConjugatedWord(root: candidate.root, form: candidate.form,
                                      tense: tense, voice: voice, slot: slot, word: word)
            }
        }
        return nil
    }

    // MARK: - Shared question makers (used by drills and custom quizzes)

    private func tenseQuestion(for verb: ConjugatedWord) -> Question {
        let correct = Self.tenseLabels[verb.tense]!
        let (options, correctIndex) = shuffled(correct: correct, others: Tense.allCases.filter { $0 != verb.tense }.map { Self.tenseLabels[$0]! })
        return Question(
            category: .tense, formID: verb.form, word: verb.word,
            gloss: gloss(of: verb), fullMeaning: contextualMeaning(of: verb),
            prompt: "What kind of verb is this?",
            options: options, correctIndex: correctIndex,
            explanation: "\(verb.word) — \(correct.arabic) from \(conjugator.citation(verb.root, form: verb.form)).",
            explainPayload: payload(for: verb)
        )
    }

    private func voiceQuestion(for verb: ConjugatedWord) -> Question {
        let correct = Self.voiceLabels[verb.voice]!
        let (options, correctIndex) = shuffled(correct: correct, others: Voice.allCases.filter { $0 != verb.voice }.map { Self.voiceLabels[$0]! })
        let waznNote = wazn(of: verb).map { " — on the pattern \($0)" } ?? ""
        return Question(
            category: .voice, formID: verb.form, word: verb.word,
            gloss: gloss(of: verb), fullMeaning: contextualMeaning(of: verb),
            prompt: "Is the doer known or unknown?",
            options: options, correctIndex: correctIndex,
            explanation: "\(verb.word) is \(correct.arabic)\(waznNote).",
            explainPayload: payload(for: verb)
        )
    }

    private func doerQuestion(for verb: ConjugatedWord) -> Question? {
        // Distractor slots must yield a *different written form* — the duals
        // share هما, and some slots conjugate identically (تَكْتُبُ is both
        // "she" and "you (m)"), which would make two options equally correct.
        let slotPool = verb.tense == .amr ? grammar.amrOnlySlots : grammar.allSlots
        let distractorSlots = slotPool
            .filter { $0 != verb.slot }
            .shuffled()
            .filter { conjugator.conjugate(verb.root, form: verb.form, tense: verb.tense, voice: verb.voice, slot: $0) != verb.word }
            .prefix(3)
        guard distractorSlots.count == 3 else { return nil }

        let correctPronoun = grammar.pronoun(verb.slot)
        let correct = AnswerOption(arabic: correctPronoun.ar, english: correctPronoun.en)
        let others = distractorSlots.map { slot -> AnswerOption in
            let p = grammar.pronoun(slot)
            return AnswerOption(arabic: p.ar, english: p.en)
        }
        let (options, correctIndex) = shuffled(correct: correct, others: Array(others))
        let prompt = verb.voice == .majhul
            ? "Who/what is this verb conjugated for (nāʾib al-fāʿil)?"
            : "Who is the doer?"
        return Question(
            category: .doer, formID: verb.form, word: verb.word,
            gloss: gloss(of: verb), fullMeaning: contextualMeaning(of: verb),
            prompt: prompt,
            options: options, correctIndex: correctIndex,
            explanation: "\(verb.word) → \(correct.arabic) (\(correct.english)), \(Self.tenseLabels[verb.tense]!.arabic) \(Self.voiceLabels[verb.voice]!.arabic).",
            explainPayload: payload(for: verb)
        )
    }

    private func waznQuestion(for verb: ConjugatedWord) -> Question? {
        // Wazn is rendered on ف-ع-ل, which needs the template engine — so
        // sālim roots only.
        guard verb.root.type == .salim, let correctWazn = wazn(of: verb) else { return nil }
        let correct = AnswerOption(arabic: correctWazn, english: grammar.form(verb.form).nameEn)

        // Distractors: the same tense/voice/slot rendered on *other* forms.
        let otherForms = FormID.allCases
            .filter { $0 != verb.form && grammar.form($0).conjugable }
            .shuffled()
            .compactMap { form -> AnswerOption? in
                guard let wazn = conjugator.wazn(of: form, tense: verb.tense, voice: verb.voice, slot: verb.slot),
                      wazn != correctWazn else { return nil }
                return AnswerOption(arabic: wazn, english: grammar.form(form).nameEn)
            }
            .prefix(3)
        guard otherForms.count >= 2 else { return nil }

        let (options, correctIndex) = shuffled(correct: correct, others: Array(otherForms))
        return Question(
            category: .wazn, formID: verb.form, word: verb.word,
            gloss: gloss(of: verb), fullMeaning: contextualMeaning(of: verb),
            prompt: "Which wazn is this word on?",
            options: options, correctIndex: correctIndex,
            explanation: "\(verb.word) = \(correctWazn) → \(grammar.form(verb.form).name).",
            explainPayload: payload(for: verb)
        )
    }

    // MARK: - Category builders (custom quizzes only)

    private func buildQuestion(category: QuestionCategory, settings: QuizSettings) -> Question? {
        switch category {
        case .tense:   return randomVerb(settings: settings).map(tenseQuestion(for:))
        case .voice:   return buildVoiceQuestion(settings: settings)
        case .doer:    return randomVerb(settings: settings).flatMap(doerQuestion(for:))
        case .wazn:    return randomVerb(settings: settings, tenses: [.madi, .mudari]).flatMap(waznQuestion(for:))
        case .mood:    return buildMoodQuestion(settings: settings)
        case .bab:     return buildBabQuestion(settings: settings)
        case .root:    return buildRootQuestion(settings: settings)
        case .derived: return buildDerivedNounQuestion(settings: settings)
        case .meaning: return buildMeaningQuestion(settings: settings)
        }
    }

    /// Voice questions only make sense when the opposite voice also exists —
    /// otherwise the answer is a giveaway.
    private func buildVoiceQuestion(settings: QuizSettings) -> Question? {
        for _ in 0..<60 {
            guard let verb = randomVerb(settings: settings, tenses: [.madi, .mudari]) else { return nil }
            let opposite: Voice = verb.voice == .malum ? .majhul : .malum
            guard conjugator.conjugate(verb.root, form: verb.form, tense: verb.tense, voice: opposite, slot: verb.slot) != nil
            else { continue }
            return voiceQuestion(for: verb)
        }
        return nil
    }

    /// Iʿrāb of the muḍāriʿ: marfūʿ / manṣūb / majzūm. Restricted to slots
    /// where the three states are visually distinct on the word, and to words
    /// where all three states exist (irregulars may lack naṣb/jazm tables).
    private func buildMoodQuestion(settings: QuizSettings) -> Question? {
        let pool = conjugatableCandidates(matching: settings)
        for _ in 0..<60 {
            guard let candidate = pool.randomElement() else { return nil }
            let mood = Mood.allCases.randomElement()!
            let slot = grammar.moodDistinguishableSlots.randomElement()!
            let voice = Voice.allCases.randomElement()!
            guard let word = conjugator.conjugate(candidate.root, form: candidate.form, tense: .mudari, voice: voice, slot: slot, mood: mood),
                  Mood.allCases.allSatisfy({ conjugator.conjugate(candidate.root, form: candidate.form, tense: .mudari, voice: voice, slot: slot, mood: $0) != nil })
            else { continue }

            let correctLabel = grammar.moodLabel(mood)
            let correct = AnswerOption(arabic: correctLabel.ar, english: correctLabel.en)
            let others = Mood.allCases.filter { $0 != mood }.map { m -> AnswerOption in
                let label = grammar.moodLabel(m)
                return AnswerOption(arabic: label.ar, english: label.en)
            }
            let (options, correctIndex) = shuffled(correct: correct, others: others)

            let explanation: String
            switch mood {
            case .raf:  explanation = "\(word) is \(correct.arabic) — the default, no governing particle."
            case .nasb: explanation = "\(word) is \(correct.arabic) — as in \"لَنْ \(word)\"."
            case .jazm: explanation = "\(word) is \(correct.arabic) — as in \"لَمْ \(word)\"."
            }
            let verb = ConjugatedWord(root: candidate.root, form: candidate.form,
                                      tense: .mudari, voice: voice, slot: slot, word: word)
            return Question(
                category: .mood, formID: candidate.form, word: word,
                gloss: gloss(of: verb), fullMeaning: contextualMeaning(of: verb),
                prompt: "What is the iʿrāb state of this muḍāriʿ?",
                options: options, correctIndex: correctIndex,
                explanation: explanation,
                explainPayload: payload(for: verb, mood: mood)
            )
        }
        return nil
    }

    /// Form I only: identify which of the six abwāb a verb follows.
    private func buildBabQuestion(settings: QuizSettings) -> Question? {
        let pool = candidates(matching: settings).filter { $0.form == .I && $0.root.type == .salim }
        guard let candidate = pool.randomElement(),
              let bab = candidate.root.entry(for: .I)?.bab else { return nil }

        let babSpec = grammar.bab(bab)
        let correct = AnswerOption(arabic: babSpec.name, english: babSpec.en)
        let others = Bab.allCases.filter { $0 != bab }.shuffled().prefix(3).map { b -> AnswerOption in
            let spec = grammar.bab(b)
            return AnswerOption(arabic: spec.name, english: spec.en)
        }
        let (options, correctIndex) = shuffled(correct: correct, others: Array(others))

        let citation = conjugator.citation(candidate.root, form: .I)
        let entryGloss = candidate.root.entry(for: .I)?.gloss ?? ""
        let verb = ConjugatedWord(root: candidate.root, form: .I, tense: .madi, voice: .malum, slot: .huwa, word: citation)
        return Question(
            category: .bab, formID: .I, word: citation,
            gloss: entryGloss, fullMeaning: contextualMeaning(of: verb),
            prompt: "Which bāb of the thulāthī mujarrad is this verb from?",
            options: options, correctIndex: correctIndex,
            explanation: "\(citation) (\(entryGloss)) follows \(babSpec.name) (\(babSpec.en)).",
            explainPayload: payload(for: verb)
        )
    }

    private func buildRootQuestion(settings: QuizSettings) -> Question? {
        guard let verb = randomVerb(settings: settings) else { return nil }
        let correct = AnswerOption(arabic: verb.root.displayLetters, english: "")
        // Root distractors come from the whole lexicon, not just the settings
        // scope — more variety, still plausible.
        let others = content.roots
            .filter { $0.joinedRadicals != verb.root.joinedRadicals }
            .shuffled().prefix(3)
            .map { AnswerOption(arabic: $0.displayLetters, english: "") }
        guard others.count == 3 else { return nil }

        let (options, correctIndex) = shuffled(correct: correct, others: Array(others))
        return Question(
            category: .root, formID: verb.form, word: verb.word,
            gloss: gloss(of: verb), fullMeaning: contextualMeaning(of: verb),
            prompt: "What is the root (three original letters)?",
            options: options, correctIndex: correctIndex,
            explanation: "\(verb.word) is from \(correct.arabic) — \(conjugator.citation(verb.root, form: verb.form)), \"\(gloss(of: verb))\".",
            explainPayload: payload(for: verb)
        )
    }

    private func buildDerivedNounQuestion(settings: QuizSettings) -> Question? {
        let pool = candidates(matching: settings).filter { $0.root.type == .salim }
        for _ in 0..<60 {
            guard let candidate = pool.randomElement() else { return nil }
            let kind = DerivedNounKind.allCases.randomElement()!
            guard let word = conjugator.derivedNoun(candidate.root, form: candidate.form, kind: kind) else { continue }

            let correct = Self.nounKindLabels[kind]!
            let others = DerivedNounKind.allCases.filter { $0 != kind }.map { Self.nounKindLabels[$0]! }
            let (options, correctIndex) = shuffled(correct: correct, others: others)

            // The samāʿī Form I maṣdar has no single wazn to cite.
            let waznNote: String
            if kind == .masdar && candidate.form == .I {
                waznNote = ""
            } else {
                let bab = candidate.root.entry(for: candidate.form)?.bab ?? .nasara
                waznNote = conjugator.waznOfDerivedNoun(of: candidate.form, kind: kind, bab: bab)
                    .map { " — pattern \($0)" } ?? ""
            }

            let entryGloss = candidate.root.entry(for: candidate.form)?.gloss ?? ""
            return Question(
                category: .derived, formID: candidate.form, word: word,
                gloss: entryGloss,
                fullMeaning: meanings.derivedNounMeaning(candidate.root, form: candidate.form, kind: kind),
                prompt: "What type of word is this?",
                options: options, correctIndex: correctIndex,
                explanation: "\(word) is the \(correct.arabic) of \(conjugator.citation(candidate.root, form: candidate.form))\(waznNote).",
                explainPayload: ExplainPayload(
                    word: word, rootLetters: candidate.root.displayLetters, form: candidate.form,
                    bab: candidate.root.entry(for: candidate.form)?.bab,
                    tense: nil, voice: nil, mood: nil, slot: nil,
                    wazn: nil, gloss: entryGloss)
            )
        }
        return nil
    }

    /// What rhetorical nuance does a mazīd bāb add ("seeking", "mutual action"…)?
    private func buildMeaningQuestion(settings: QuizSettings) -> Question? {
        let pool = candidates(matching: settings).filter {
            FormID.mazeedForms.contains($0.form)
                && !grammar.form($0.form).meanings.isEmpty
                && $0.root.type == .salim
        }
        guard let candidate = pool.randomElement() else { return nil }
        let spec = grammar.form(candidate.form)
        guard let meaningID = spec.meanings.randomElement(),
              let correctLabel = grammar.meaningLabel(meaningID) else { return nil }

        let correct = AnswerOption(arabic: correctLabel.ar, english: correctLabel.en)
        let distractorIDs = Self.allMeaningIDs.filter { !spec.meanings.contains($0) }.shuffled().prefix(3)
        let others = distractorIDs.compactMap { grammar.meaningLabel($0) }
            .map { AnswerOption(arabic: $0.ar, english: $0.en) }
        guard others.count == 3 else { return nil }

        let (options, correctIndex) = shuffled(correct: correct, others: others)
        let citationWord = conjugator.citation(candidate.root, form: candidate.form)
            .split(separator: " ").first.map(String.init) ?? ""
        let entryGloss = candidate.root.entry(for: candidate.form)?.gloss ?? ""
        let verb = ConjugatedWord(root: candidate.root, form: candidate.form,
                                  tense: .madi, voice: .malum, slot: .huwa, word: citationWord)
        return Question(
            category: .meaning, formID: candidate.form, word: citationWord,
            gloss: entryGloss, fullMeaning: contextualMeaning(of: verb),
            prompt: "\"\(entryGloss)\" — what nuance does \(spec.name) add here?",
            options: options, correctIndex: correctIndex,
            explanation: "\(spec.name) (\(spec.nameEn)) commonly signifies \(correct.english).",
            explainPayload: payload(for: verb)
        )
    }

    // MARK: - Small shared helpers

    private func gloss(of verb: ConjugatedWord) -> String {
        verb.root.entry(for: verb.form)?.gloss ?? ""
    }

    private func contextualMeaning(of verb: ConjugatedWord) -> String {
        meanings.verbMeaning(verb.root, form: verb.form, tense: verb.tense, voice: verb.voice, slot: verb.slot)
    }

    private func wazn(of verb: ConjugatedWord) -> String? {
        guard verb.root.type == .salim else { return nil }
        let bab = verb.root.entry(for: verb.form)?.bab ?? .nasara
        return conjugator.wazn(of: verb.form, tense: verb.tense, voice: verb.voice, slot: verb.slot, bab: bab)
    }

    private func payload(for verb: ConjugatedWord, mood: Mood? = nil) -> ExplainPayload {
        ExplainPayload(
            word: verb.word,
            rootLetters: verb.root.displayLetters,
            form: verb.form,
            bab: verb.root.entry(for: verb.form)?.bab,
            tense: verb.tense,
            voice: verb.voice,
            mood: mood,
            slot: verb.slot,
            wazn: wazn(of: verb),
            gloss: gloss(of: verb)
        )
    }

    private func shuffled(correct: AnswerOption, others: [AnswerOption]) -> (options: [AnswerOption], correctIndex: Int) {
        let options = ([correct] + others).shuffled()
        return (options, options.firstIndex(of: correct)!)
    }

    // MARK: - Static labels

    private static let tenseLabels: [Tense: AnswerOption] = [
        .madi:   AnswerOption(arabic: "فِعْل مَاضٍ", english: "past (māḍī)"),
        .mudari: AnswerOption(arabic: "فِعْل مُضَارِع", english: "present/future (muḍāriʿ)"),
        .amr:    AnswerOption(arabic: "فِعْل أَمْر", english: "command (amr)"),
    ]

    private static let voiceLabels: [Voice: AnswerOption] = [
        .malum:  AnswerOption(arabic: "مَعْلُوم", english: "active — doer is known"),
        .majhul: AnswerOption(arabic: "مَجْهُول", english: "passive — doer is unknown"),
    ]

    private static let nounKindLabels: [DerivedNounKind: AnswerOption] = [
        .ismFail:  AnswerOption(arabic: "اسْم فَاعِل", english: "doer noun (ism fāʿil)"),
        .ismMaful: AnswerOption(arabic: "اسْم مَفْعُول", english: "receiver noun (ism mafʿūl)"),
        .masdar:   AnswerOption(arabic: "مَصْدَر", english: "verbal noun (maṣdar)"),
    ]

    /// Every rhetorical meaning id (distractor pool for meaning questions).
    private static let allMeaningIDs: [String] = [
        "taadiya", "takthir", "musharaka2", "musharaka3", "mutawaa", "mutawaa_II",
        "takalluf", "tazahur", "ittikhadh", "alwan_uyub", "talab", "itiqad",
    ]
}

// MARK: - Category display metadata (mirrors the prototype's CATEGORIES)

extension QuestionCategory {
    public var displayLabel: String {
        switch self {
        case .tense:   return "Tense"
        case .voice:   return "Voice"
        case .doer:    return "Doer"
        case .wazn:    return "Wazn"
        case .mood:    return "Iʿrāb"
        case .bab:     return "Bāb (Form I)"
        case .root:    return "Root"
        case .derived: return "Derived nouns"
        case .meaning: return "Meanings"
        }
    }

    public var arabicLabel: String {
        switch self {
        case .tense:   return "زمن الفعل"
        case .voice:   return "معلوم/مجهول"
        case .doer:    return "الضمير"
        case .wazn:    return "الوزن"
        case .mood:    return "الرفع والنصب والجزم"
        case .bab:     return "أبواب المجرد"
        case .root:    return "الجذر"
        case .derived: return "المشتقات"
        case .meaning: return "معاني الأبواب"
        }
    }
}
