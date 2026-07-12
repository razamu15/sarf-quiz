// The grammar of the conjugation system, decoded from patterns.json.
//
// This is *static* linguistic data — affix tables, stem templates, form
// metadata — exported from the web prototype (the authoring environment) by
// `web-prototype/tools/export-content.mjs`. The JSON keeps string keys; this
// file exposes enum-typed accessors so the rest of the engine never touches
// raw strings.
//
// Content invariant: the tables are complete (every slot, every form, every
// mood). `ContentStore` validates this at load, so the accessors here treat a
// missing entry as a programmer/content error and fail loudly.

import Foundation

// MARK: - Leaf value types

/// How a word ends for one pronoun slot: the ḥaraka placed on the final
/// radical plus the suffix text. `stem + finalHaraka + suffix` = full word.
public struct Affix: Decodable {
    public let finalHaraka: String
    public let suffix: String
}

/// A pronoun's Arabic form and English rendering ("هُوَ" / "he").
public struct Pronoun: Decodable {
    public let ar: String
    public let en: String
}

/// One of the six abwāb of Form I: display name plus its two ʿayn-vowels.
public struct BabSpec: Decodable {
    public let name: String   // "نَصَرَ يَنْصُرُ"
    public let en: String     // "fatḥa / ḍamma"
    public let v1: String     // māḍī ʿayn-vowel
    public let v2: String     // muḍāriʿ ʿayn-vowel
}

/// Stem templates for one (form, bāb) combination. Templates use "1"/"2"/"3"
/// as radical placeholders and omit the final radical's ḥaraka (the affix
/// supplies it).
public struct StemSet: Decodable {
    public let madi: String?
    public let mudari: String?
    public let amr: String?
}

/// Everything the grammar knows about one verb form (I–X).
public struct FormSpec: Decodable {
    public let num: Int
    public let name: String              // "بَابُ التَّفْعِيل"
    public let nameEn: String            // "Form II (tafʿīl)"
    public let conjugable: Bool          // false → Form IX (recognition-only)
    public let hasMajhul: Bool           // false → Form VII (lāzim)
    public let mudariPrefixHaraka: String
    public let madiMajhulStem: String?
    public let mudariMajhulStem: String?
    public let ismFailTemplate: String?
    public let ismMafulTemplate: String?
    public let masdarTemplate: String?   // nil for Form I (samāʿī, stored per root)
    public let meanings: [String]        // rhetorical meaning ids (taʿdiya, ṭalab…)

    // Exactly one of these is present: Form I stems vary by bāb, mazīd stems
    // are fixed.
    private let stems: StemSet?
    private let stemsByBab: [String: StemSet]?

    /// The active-voice stem templates for this form. Form I requires a bāb;
    /// mazīd forms ignore it.
    public func stemSet(for bab: Bab?) -> StemSet? {
        if let byBab = stemsByBab {
            guard let bab else { return nil }
            return byBab[String(bab.rawValue)]
        }
        return stems
    }
}

/// A rhetorical meaning a bāb can signify (taʿdiya, mushāraka, ṭalab…).
public struct MeaningLabel: Decodable {
    public let ar: String
    public let en: String
}

/// Display metadata for a verb-type classification.
public struct VerbTypeInfo: Decodable {
    public let ar: String
    public let en: String
    public let group: String   // "ṣaḥīḥ" or "muʿtall"
}

/// Display metadata for a muḍāriʿ mood.
public struct MoodLabel: Decodable {
    public let ar: String
    public let en: String
}

// MARK: - GrammarTables

/// The static reference data of the grammar — the printed tables a sarf
/// student memorizes, as one decoded value.
///
/// This is data, not logic: affix rows, stem templates, slot lists, labels.
/// The rules for *using* them (how a word is assembled, when majhūl exists,
/// what wins between override tables and templates) live in `Conjugator`;
/// this type only answers lookups. It is also *closed* data: adding verbs
/// grows roots.json, never this — it changes only if the grammar model
/// itself changes.
///
/// Lifecycle: `ContentStore` decodes exactly one of these at launch,
/// validates it, and hands it to `Conjugator` / `QuizGenerator` /
/// `MeaningRenderer` through their initializers. So the app runs on a single
/// instance *by construction* — but this is deliberately not a singleton:
/// no `.shared`, no global. Tests (and future tooling) build their own from
/// any content directory without fighting a global.
public struct GrammarTables: Decodable {
    // Raw storage, string-keyed exactly as in the JSON.
    private let slots: [String]
    private let amrSlots: [String]
    private let moodDistinctSlots: [String]
    private let pronouns: [String: Pronoun]
    private let madiAffixes: [String: Affix]
    private let mudariAffixesByMood: [String: [String: Affix]]
    private let amrAffixes: [String: Affix]
    private let mudariPrefixLetters: [String: String]
    private let abwab: [String: BabSpec]
    private let forms: [String: FormSpec]
    private let moods: [String: MoodLabel]
    private let meanings: [String: MeaningLabel]
    private let verbTypes: [String: VerbTypeInfo]

    // MARK: Slots

    /// All 14 slots in traditional table order.
    public var allSlots: [PronounSlot] { slots.compactMap(PronounSlot.init) }

    /// The six second-person slots — the only ones amr exists for.
    public var amrOnlySlots: [PronounSlot] { amrSlots.compactMap(PronounSlot.init) }

    /// Slots where marfūʿ / manṣūb / majzūm are visually distinct on the word
    /// (duals and plurals conflate naṣb and jazm; nūn al-niswa never changes).
    public var moodDistinguishableSlots: [PronounSlot] { moodDistinctSlots.compactMap(PronounSlot.init) }

    // MARK: Typed accessors

    public func pronoun(_ slot: PronounSlot) -> Pronoun {
        guard let p = pronouns[slot.rawValue] else { contentMissing("pronoun \(slot)") }
        return p
    }

    public func madiAffix(_ slot: PronounSlot) -> Affix {
        guard let a = madiAffixes[slot.rawValue] else { contentMissing("madi affix \(slot)") }
        return a
    }

    public func mudariAffix(_ slot: PronounSlot, mood: Mood) -> Affix {
        guard let a = mudariAffixesByMood[mood.rawValue]?[slot.rawValue] else {
            contentMissing("mudari affix \(slot) \(mood)")
        }
        return a
    }

    /// nil outside the second person — amr has no other slots.
    public func amrAffix(_ slot: PronounSlot) -> Affix? {
        amrAffixes[slot.rawValue]
    }

    public func mudariPrefixLetter(_ slot: PronounSlot) -> String {
        guard let l = mudariPrefixLetters[slot.rawValue] else { contentMissing("prefix letter \(slot)") }
        return l
    }

    public func form(_ id: FormID) -> FormSpec {
        guard let f = forms[id.rawValue] else { contentMissing("form \(id)") }
        return f
    }

    public func bab(_ bab: Bab) -> BabSpec {
        guard let b = abwab[String(bab.rawValue)] else { contentMissing("bab \(bab)") }
        return b
    }

    public func moodLabel(_ mood: Mood) -> MoodLabel {
        guard let m = moods[mood.rawValue] else { contentMissing("mood \(mood)") }
        return m
    }

    public func meaningLabel(_ id: String) -> MeaningLabel? {
        meanings[id]
    }

    public func verbTypeInfo(_ type: VerbType) -> VerbTypeInfo {
        guard let t = verbTypes[type.rawValue] else { contentMissing("verb type \(type)") }
        return t
    }

    /// Load-time completeness check, called by ContentStore. Ensures the
    /// accessors above can never trap at quiz time.
    func validateCompleteness() throws {
        for slot in PronounSlot.allCases {
            guard pronouns[slot.rawValue] != nil,
                  madiAffixes[slot.rawValue] != nil,
                  mudariPrefixLetters[slot.rawValue] != nil,
                  Mood.allCases.allSatisfy({ mudariAffixesByMood[$0.rawValue]?[slot.rawValue] != nil })
            else { throw ContentError.incompleteGrammar("slot \(slot.rawValue)") }
        }
        for id in FormID.allCases where forms[id.rawValue] == nil {
            throw ContentError.incompleteGrammar("form \(id.rawValue)")
        }
        for bab in Bab.allCases where abwab[String(bab.rawValue)] == nil {
            throw ContentError.incompleteGrammar("bab \(bab.rawValue)")
        }
    }

    private func contentMissing(_ what: String) -> Never {
        fatalError("Grammar content is missing \(what) — validateCompleteness should have caught this at load")
    }
}

public enum ContentError: Error {
    case resourceNotFound(String)
    case incompleteGrammar(String)
}
