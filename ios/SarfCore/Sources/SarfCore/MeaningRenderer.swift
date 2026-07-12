// English meaning rendering: turns (root form, tense, voice, pronoun) into a
// contextual translation — "he hit", "she was taught", "throw! (you (f))".
// The generic gloss ("to hit") is shown before answering; the contextual
// meaning after — vocab enrichment alongside the sarf drilling.

import Foundation

public struct MeaningRenderer {
    private let grammar: GrammarTables

    public init(grammar: GrammarTables) {
        self.grammar = grammar
    }

    // MARK: - Public API

    /// "he hit", "it was said", "they write / will write", "throw! (you (f))"
    public func verbMeaning(
        _ root: Root, form: FormID, tense: Tense, voice: Voice, slot: PronounSlot
    ) -> String {
        guard let entry = root.entry(for: form) else { return "" }
        let subject = grammar.pronoun(slot).en
        let verb = EnglishVerb(entry: entry)

        // Stative glosses ("to be safe") conjugate on the verb *to be* itself.
        if let quality = verb.stativeQuality {
            switch tense {
            case .madi:   return "\(subject) \(bePast(slot)) \(quality)"
            case .mudari: return "\(subject) \(bePresent(slot)) \(quality) / will be \(quality)"
            case .amr:    return "\(quality)! (\(subject))"
            }
        }

        switch (tense, voice) {
        case (.madi, .malum):
            return "\(subject) \(verb.past)"
        case (.madi, .majhul):
            return "\(subject) \(bePast(slot)) \(verb.pastParticiple)"
        case (.mudari, .malum):
            let conjugated = isThirdSingular(slot) ? verb.presentThirdSingular : verb.base
            return "\(subject) \(conjugated) / will \(verb.base)"
        case (.mudari, .majhul):
            return "\(subject) \(bePresent(slot)) being \(verb.pastParticiple) / will be \(verb.pastParticiple)"
        case (.amr, _):
            return "\(verb.base)! (\(subject))"
        }
    }

    /// "one who teaches", "that which is written", "teaching (the act itself)"
    public func derivedNounMeaning(_ root: Root, form: FormID, kind: DerivedNounKind) -> String {
        guard let entry = root.entry(for: form) else { return "" }
        let verb = EnglishVerb(entry: entry)

        if let quality = verb.stativeQuality {
            switch kind {
            case .ismFail: return "one who is \(quality)"
            case .masdar:  return "being \(quality) (the quality itself)"
            case .ismMaful: return ""
            }
        }
        switch kind {
        case .ismFail:  return "one who \(verb.presentThirdSingular)"
        case .ismMaful: return "that which is \(verb.pastParticiple)"
        case .masdar:   return "\(verb.gerund) (the act itself)"
        }
    }

    // MARK: - English verb pieces

    /// The English conjugation bits for one form entry, with regular-verb
    /// fallbacks (base+"ed", base+"s", …) when the content omits a field.
    private struct EnglishVerb {
        let base: String
        let past: String
        let pastParticiple: String
        let presentThirdSingular: String
        let gerund: String
        /// Non-nil for "to be X" glosses; holds the X ("safe", "noble").
        let stativeQuality: String?

        init(entry: FormEntry) {
            let base = entry.gloss.hasPrefix("to ") ? String(entry.gloss.dropFirst(3)) : entry.gloss
            if base.hasPrefix("be ") {
                self.stativeQuality = String(base.dropFirst(3))
                self.base = base
                self.past = base; self.pastParticiple = base
                self.presentThirdSingular = base; self.gerund = base
                return
            }
            let english = entry.english
            self.stativeQuality = nil
            self.base = base
            self.past = english?.past ?? base + "ed"
            self.pastParticiple = english?.pp ?? english?.past ?? base + "ed"
            self.presentThirdSingular = english?.pres3 ?? base + "s"
            self.gerund = english?.ing ?? base + "ing"
        }
    }

    // MARK: - "to be" conjugation by slot

    private func isThirdSingular(_ slot: PronounSlot) -> Bool {
        slot == ._3ms || slot == ._3fs
    }

    private func bePast(_ slot: PronounSlot) -> String {
        (isThirdSingular(slot) || slot == ._1s) ? "was" : "were"
    }

    private func bePresent(_ slot: PronounSlot) -> String {
        if slot == ._1s { return "am" }
        return isThirdSingular(slot) ? "is" : "are"
    }
}
