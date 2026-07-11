// The conjugation engine. Pure functions from (root, form, tense, voice,
// slot, mood) to a fully-voweled Arabic word — or nil when that combination
// doesn't exist in the language (majhūl of a lāzim verb, amr outside the
// second person, …).
//
// How a word is assembled (sālim roots):
//
//   template "1َ2ِّ3"  --fill radicals-->  stem "عَلِّم"
//   + affix (finalHaraka, suffix) for the slot   e.g. (sukūn, "نَ")
//   + muḍāriʿ only: prefix letter + prefix ḥaraka in front
//   --NFC normalize-->  "عَلِّمْنَ"
//
// Irregular roots bypass all of that: their FormEntry carries hand-authored
// tables, checked first. That lookup is the *entire* irregular-verb mechanism.

import Foundation

public struct Conjugator {
    private let grammar: GrammarTables

    public init(grammar: GrammarTables) {
        self.grammar = grammar
    }

    // MARK: - Conjugation

    /// The engine's main entry point. Returns nil for combinations that don't
    /// exist rather than throwing — "does this form exist?" is a normal
    /// question during quiz generation, not an error.
    public func conjugate(
        _ root: Root, form: FormID, tense: Tense, voice: Voice,
        slot: PronounSlot, mood: Mood = .raf
    ) -> String? {
        guard let entry = root.entry(for: form) else { return nil }

        // 1. Hand-authored override wins. If the root has a table for this
        //    tense/voice/mood, the answer is whatever the table says (including
        //    "nothing" for a missing slot).
        if let table = entry.overrideTable(named: Self.overrideTableKey(tense: tense, voice: voice, mood: mood)) {
            return table[slot.rawValue]?.nfcNormalized
        }

        // 2. The template engine only handles sound roots; an irregular root
        //    without a table simply has no content yet.
        guard root.type == .salim else { return nil }

        let spec = grammar.form(form)
        guard spec.conjugable else { return nil }
        if voice == .majhul && (!spec.hasMajhul || !entry.isTransitive) { return nil }

        // 3. Assemble from stem + affix.
        let word: String?
        switch tense {
        case .madi:   word = assembleMadi(spec: spec, entry: entry, root: root, voice: voice, slot: slot)
        case .mudari: word = assembleMudari(spec: spec, entry: entry, root: root, voice: voice, slot: slot, mood: mood)
        case .amr:    word = assembleAmr(spec: spec, entry: entry, root: root, voice: voice, slot: slot)
        }
        return word?.nfcNormalized
    }

    /// Table keys mirror the content schema: "madi_malum", "mudari_majhul",
    /// and mood-suffixed muḍāriʿ variants like "mudari_malum_jazm"
    /// (raf is the unmarked default, so it carries no suffix).
    static func overrideTableKey(tense: Tense, voice: Voice, mood: Mood) -> String {
        if tense == .mudari && mood != .raf {
            return "mudari_\(voice.rawValue)_\(mood.rawValue)"
        }
        return "\(tense.rawValue)_\(voice.rawValue)"
    }

    private func assembleMadi(spec: FormSpec, entry: FormEntry, root: Root, voice: Voice, slot: PronounSlot) -> String? {
        let stemTemplate = voice == .majhul ? spec.madiMajhulStem : spec.stemSet(for: entry.bab)?.madi
        guard let stemTemplate else { return nil }
        let affix = grammar.madiAffix(slot)
        return fill(stemTemplate, with: root.radicals) + affix.finalHaraka + affix.suffix
    }

    private func assembleMudari(spec: FormSpec, entry: FormEntry, root: Root, voice: Voice, slot: PronounSlot, mood: Mood) -> String? {
        let stemTemplate = voice == .majhul ? spec.mudariMajhulStem : spec.stemSet(for: entry.bab)?.mudari
        guard let stemTemplate else { return nil }
        let affix = grammar.mudariAffix(slot, mood: mood)
        // Prefix ḥaraka: always ḍamma in majhūl (يُكْتَب); otherwise per form
        // (ḍamma for II–IV, fatḥa elsewhere).
        let prefixHaraka = voice == .majhul ? ArabicMark.damma : spec.mudariPrefixHaraka
        return grammar.mudariPrefixLetter(slot) + prefixHaraka
            + fill(stemTemplate, with: root.radicals) + affix.finalHaraka + affix.suffix
    }

    private func assembleAmr(spec: FormSpec, entry: FormEntry, root: Root, voice: Voice, slot: PronounSlot) -> String? {
        guard voice == .malum,
              let stemTemplate = spec.stemSet(for: entry.bab)?.amr,
              let affix = grammar.amrAffix(slot)   // nil outside 2nd person
        else { return nil }
        return fill(stemTemplate, with: root.radicals) + affix.finalHaraka + affix.suffix
    }

    /// Substitutes the radical placeholders "1"/"2"/"3" in a stem template.
    ///
    /// This must operate on Unicode *scalars*, not on String/Character: a
    /// placeholder digit followed by an Arabic combining mark (e.g. "1" + fatḥa)
    /// forms a single grapheme cluster in Swift, so string-level replacement of
    /// "1" would silently miss every placeholder that carries a ḥaraka.
    private func fill(_ template: String, with radicals: [String]) -> String {
        var result = ""
        for scalar in template.unicodeScalars {
            switch scalar {
            case "1": result += radicals[0]
            case "2": result += radicals[1]
            case "3": result += radicals[2]
            default:  result.unicodeScalars.append(scalar)
            }
        }
        return result
    }

    // MARK: - Full tables

    /// All slots for one tense/voice/mood, skipping slots that don't exist.
    /// Returns nil when nothing exists at all (e.g. majhūl of a lāzim verb).
    public func fullTable(
        _ root: Root, form: FormID, tense: Tense, voice: Voice, mood: Mood = .raf
    ) -> [PronounSlot: String]? {
        let slots = tense == .amr ? grammar.amrOnlySlots : grammar.allSlots
        var table: [PronounSlot: String] = [:]
        for slot in slots {
            if let word = conjugate(root, form: form, tense: tense, voice: voice, slot: slot, mood: mood) {
                table[slot] = word
            }
        }
        return table.isEmpty ? nil : table
    }

    // MARK: - Derived nouns

    public func derivedNoun(_ root: Root, form: FormID, kind: DerivedNounKind) -> String? {
        guard let entry = root.entry(for: form), root.type == .salim else { return nil }
        let spec = grammar.form(form)
        switch kind {
        case .ismFail:
            return spec.ismFailTemplate.map { fill($0, with: root.radicals).nfcNormalized }
        case .ismMaful:
            guard entry.isTransitive else { return nil }
            return spec.ismMafulTemplate.map { fill($0, with: root.radicals).nfcNormalized }
        case .masdar:
            // Form I maṣdar is samāʿī — stored on the root, not templated.
            if form == .I { return entry.masdar?.nfcNormalized }
            return spec.masdarTemplate.map { fill($0, with: root.radicals).nfcNormalized }
        }
    }

    // MARK: - Wazn

    /// The wazn of any generated word is the same template applied to the
    /// reference root ف-ع-ل — so wazn rendering reuses the whole pipeline.
    public func wazn(
        of form: FormID, tense: Tense, voice: Voice, slot: PronounSlot,
        bab: Bab = .nasara, mood: Mood = .raf
    ) -> String? {
        conjugate(Self.waznReferenceRoot(for: form, bab: bab), form: form, tense: tense, voice: voice, slot: slot, mood: mood)
    }

    public func waznOfDerivedNoun(of form: FormID, kind: DerivedNounKind, bab: Bab = .nasara) -> String? {
        derivedNoun(Self.waznReferenceRoot(for: form, bab: bab), form: form, kind: kind)
    }

    /// Dictionary-style citation of a form's pattern, e.g. "فَعَّلَ يُفَعِّلُ".
    /// Works for Form IX too (via the display-only path in `citation`).
    public func waznCitation(_ form: FormID) -> String {
        citation(Self.waznReferenceRoot(for: form), form: form)
    }

    private static func waznReferenceRoot(for form: FormID, bab: Bab = .nasara) -> Root {
        SyntheticRoot.make(radicals: ["ف", "ع", "ل"], form: form, bab: bab)
    }

    // MARK: - Citation

    /// Dictionary citation "māḍī muḍāriʿ" (e.g. "نَصَرَ يَنْصُرُ"), used in quiz
    /// explanations. Form IX is not conjugable in the engine yet, so its
    /// citation is built directly from the display templates.
    public func citation(_ root: Root, form: FormID) -> String {
        let past = conjugate(root, form: form, tense: .madi, voice: .malum, slot: .huwa)
        let present = conjugate(root, form: form, tense: .mudari, voice: .malum, slot: .huwa)
        if let past, let present { return "\(past) \(present)" }

        let spec = grammar.form(form)
        if past == nil, !spec.conjugable, root.type == .salim,
           let madi = spec.stemSet(for: root.entry(for: form)?.bab ?? .nasara)?.madi,
           let mudari = spec.stemSet(for: root.entry(for: form)?.bab ?? .nasara)?.mudari {
            let filledMadi = fill(madi, with: root.radicals) + ArabicMark.fatha
            let filledMudari = "ي" + ArabicMark.fatha + fill(mudari, with: root.radicals) + ArabicMark.damma
            return "\(filledMadi) \(filledMudari)".nfcNormalized
        }
        return past ?? ""
    }
}

// MARK: - Support

/// Unicode combining marks the engine needs by name.
enum ArabicMark {
    static let fatha = "\u{064E}"
    static let damma = "\u{064F}"
    static let kasra = "\u{0650}"
    static let sukun = "\u{0652}"
    static let shadda = "\u{0651}"
}

/// Builds throwaway Root values (used for wazn rendering on ف-ع-ل). Kept out
/// of Root's public API — real roots always come from content.
enum SyntheticRoot {
    static func make(radicals: [String], form: FormID, bab: Bab) -> Root {
        let entry = FormEntry(bab: bab, gloss: "", masdar: nil, isTransitive: true, english: nil)
        return Root(radicals: radicals, type: .salim, forms: [form: entry])
    }
}
