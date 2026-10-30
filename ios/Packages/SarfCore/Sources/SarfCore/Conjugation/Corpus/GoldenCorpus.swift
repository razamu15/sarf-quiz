// golden-corpus.json: every word the JS service gave for the lexicon, decoded
// and checked.

import Foundation

/// One form of one root, as the corpus holds it.
///
/// Used by: CorpusConjugator.
struct CorpusBlock: Sendable {
    /// "كَتَبَ يَكْتُبُ". Nil if the verb has none.
    let citation: String?
    /// A noun the verb doesn't have has no entry.
    let derived: [DerivedNounType: String]
    /// A chart that doesn't exist has no entry. A slot with no word is left out
    /// of its chart.
    let charts: [ChartShape: [PronounSlot: String]]
}

/// A pattern's identity in the corpus: its form, and its bāb for Form I.
///
/// Used by: GoldenCorpus, CorpusConjugator.
struct WaznKey: Hashable, Sendable {
    let form: VerbForm
    let bab: Bab?
}

/// The whole file. Unlike the lexicon it has no `Root`s, only answers, so
/// everything is keyed by letters and form.
///
/// Used by: ConjugationService.load, CorpusConjugator.
struct GoldenCorpus: Sendable {
    /// The hash of the roots.json this was exported from.
    let rootsHash: String
    /// By the root's letters ("كتب"), then by form.
    let roots: [String: [VerbForm: CorpusBlock]]
    /// The reference root's patterns.
    let wazn: [WaznKey: CorpusBlock]
}

private func corrupt(_ decoder: Decoder, _ why: String) -> DecodingError {
    DecodingError.dataCorrupted(.init(codingPath: decoder.codingPath, debugDescription: why))
}

extension CorpusBlock: Decodable {
    private enum CodingKeys: String, CodingKey { case citation, derived, charts }

    /// The exporter writes every key, with null for "none", so a missing one
    /// means the corpus is out of date and is an error, not an absence.
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        let citation = try container.decode(String?.self, forKey: .citation)
        // No citation is null, never "".
        guard citation != "" else { throw corrupt(decoder, "citation is \"\"; it should be null") }
        self.citation = citation

        let rawNouns = try container.decode([String: String?].self, forKey: .derived)
        var derived: [DerivedNounType: String] = [:]
        for (name, noun) in rawNouns {
            guard let type = DerivedNounType(rawValue: name) else { throw corrupt(decoder, "unknown noun type \"\(name)\"") }
            derived[type] = noun
        }
        guard rawNouns.count == DerivedNounType.allCases.count else {
            throw corrupt(decoder, "every noun type must be written, null if there is none")
        }
        self.derived = derived

        var charts: [ChartShape: [PronounSlot: String]] = [:]
        var seen = Set<ChartShape>()
        for chart in try container.decode([Chart].self, forKey: .charts) {
            guard seen.insert(chart.shape).inserted else { throw corrupt(decoder, "\(chart.shape) appears twice") }
            guard let words = chart.words else { continue }
            charts[chart.shape] = try Self.table(words, of: chart.shape, decoder)
        }
        guard seen.count == ChartShape.all.count else {
            throw corrupt(decoder, "a form has all nine charts, but this has \(seen.count)")
        }
        self.charts = charts
    }

    /// A chart's words by slot. Every slot of the tense is written, null where
    /// there is no word, and nothing else is.
    private static func table(_ words: [String: String?], of shape: ChartShape, _ decoder: Decoder) throws -> [PronounSlot: String] {
        var table: [PronounSlot: String] = [:]
        for (name, word) in words {
            guard let slot = PronounSlot(rawValue: name), shape.tense.slots.contains(slot) else {
                throw corrupt(decoder, "\"\(name)\" is not a slot of the \(shape.tense.rawValue) chart")
            }
            table[slot] = word
        }
        guard words.count == shape.tense.slots.count else {
            throw corrupt(decoder, "the \(shape.tense.rawValue) chart must write all \(shape.tense.slots.count) slots")
        }
        return table
    }

    /// A chart as written: its shape and its words, or null words for a chart
    /// that doesn't exist.
    private struct Chart: Decodable {
        let shape: ChartShape
        let words: [String: String?]?

        private enum CodingKeys: String, CodingKey { case words }

        init(from decoder: Decoder) throws {
            shape = try ChartShape(from: decoder)
            words = try decoder.container(keyedBy: CodingKeys.self).decode([String: String?]?.self, forKey: .words)
        }
    }
}

extension GoldenCorpus: Decodable {
    private enum CodingKeys: String, CodingKey { case rootsHash, roots, wazn }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        rootsHash = try container.decode(String.self, forKey: .rootsHash)

        var roots: [String: [VerbForm: CorpusBlock]] = [:]
        for (key, rawForms) in try container.decode([String: [String: CorpusBlock]].self, forKey: .roots) {
            var forms: [VerbForm: CorpusBlock] = [:]
            for (name, block) in rawForms {
                guard let form = VerbForm(rawValue: name) else {
                    throw DecodingError.dataCorruptedError(
                        forKey: .roots, in: container, debugDescription: "root \(key): unknown form \"\(name)\"")
                }
                forms[form] = block
            }
            roots[key] = forms
        }
        self.roots = roots

        var wazn: [WaznKey: CorpusBlock] = [:]
        for entry in try container.decode([WaznEntry].self, forKey: .wazn) {
            guard wazn.updateValue(entry.block, forKey: entry.key) == nil else {
                throw DecodingError.dataCorruptedError(
                    forKey: .wazn, in: container, debugDescription: "pattern \(entry.key) appears twice")
            }
        }
        self.wazn = wazn
    }

    /// One pattern as written. Only Form I has a bāb, and it always has one.
    private struct WaznEntry: Decodable {
        let key: WaznKey
        let block: CorpusBlock

        private enum CodingKeys: String, CodingKey { case form, bab, block }

        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            let form = try container.decode(VerbForm.self, forKey: .form)
            let bab = try container.decode(Bab?.self, forKey: .bab)
            guard (form == .i) == (bab != nil) else {
                throw corrupt(decoder, "pattern \(form.rawValue): only Form I has a bāb, and it always does")
            }
            key = WaznKey(form: form, bab: bab)
            block = try container.decode(CorpusBlock.self, forKey: .block)
        }
    }
}
