// The lexicon side of the model: what is *lexical* about a verb (cannot be
// derived from grammar) lives here, decoded from roots.json.

import Foundation

/// English conjugation pieces for meaning display ("he wrote" / "written" /
/// "she teaches"). Any missing field falls back to regular-verb morphology in
/// MeaningRenderer.
public struct EnglishForms: Decodable {
    public let past: String?    // wrote
    public let pp: String?      // written (past participle, for passive)
    public let pres3: String?   // writes  (3rd-person singular present)
    public let ing: String?     // writing (for the maṣdar)
}

/// One root's usage of one verb form: the bāb choice (Form I only), meaning,
/// transitivity, samāʿī maṣdar — and, for irregular roots, explicit
/// hand-authored conjugation tables that override the engine.
public struct FormEntry: Decodable {
    public let bab: Bab?               // Form I only
    public let gloss: String           // "to write" — generic meaning
    public let masdar: String?         // Form I samāʿī maṣdar ("كِتَابَة")
    public let isTransitive: Bool      // gates majhūl and ism mafʿūl
    public let english: EnglishForms?

    /// Irregular-verb tables, keyed like "madi_malum", "mudari_majhul",
    /// "mudari_malum_jazm" — see Conjugator.overrideTableKey. Values are
    /// slot-code → fully-voweled word.
    private let tables: [String: [String: String]]?

    public func overrideTable(named key: String) -> [String: String]? {
        tables?[key]
    }

    public var hasOverrideTables: Bool { tables != nil }

    /// For engine-internal synthetic entries (wazn rendering); real entries
    /// come from content decoding.
    init(bab: Bab?, gloss: String, masdar: String?, isTransitive: Bool, english: EnglishForms?) {
        self.bab = bab
        self.gloss = gloss
        self.masdar = masdar
        self.isTransitive = isTransitive
        self.english = english
        self.tables = nil
    }
}

/// A three-letter root, its verb-type classification, and the forms it is
/// actually used in. Sālim roots are conjugated by the engine; every other
/// type must supply override tables (slots without a table simply don't exist
/// yet and are never quizzed).
public struct Root: Decodable {
    public let radicals: [String]              // ["ك","ت","ب"]
    public let type: VerbType
    private let forms: [String: FormEntry]     // keyed by FormID raw value

    public func entry(for form: FormID) -> FormEntry? {
        forms[form.rawValue]
    }

    public var availableForms: [FormID] {
        FormID.allCases.filter { forms[$0.rawValue] != nil }
    }

    /// The root spelled out for display and quiz options: "ك - ت - ب".
    public var displayLetters: String {
        radicals.joined(separator: " - ")
    }

    /// Compact identity for equality checks and cache keys: "كتب".
    public var joinedRadicals: String {
        radicals.joined()
    }

    /// For engine-internal synthetic roots (wazn rendering on ف-ع-ل); real
    /// roots come from content decoding.
    init(radicals: [String], type: VerbType, forms: [FormID: FormEntry]) {
        self.radicals = radicals
        self.type = type
        self.forms = Dictionary(uniqueKeysWithValues: forms.map { ($0.key.rawValue, $0.value) })
    }
}
