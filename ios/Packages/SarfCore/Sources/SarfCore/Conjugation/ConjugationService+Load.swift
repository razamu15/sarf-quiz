// Building the service the app uses.

import Foundation

extension ConjugationService {
    /// The groups whose own engine is written. Flipping a group to `.engine` in
    /// `engineBacking` needs its entry here too.
    private static let engines: [VerbTypeGroup: any VerbTypeConjugator] = [:]

    /// The service, wired the way `engineBacking` says: each group answers from
    /// its own engine or from the corpus, and a group with neither has no words.
    ///
    /// Fails if the bundled roots.json isn't the one the corpus was exported
    /// from, since the corpus would then answer for a lexicon it doesn't match.
    ///
    /// Used by: AppModel (once, after the lexicon).
    public static func load() throws -> ConjugationService {
        try load(rootsData: bundledData("roots"), corpusData: bundledData("golden-corpus"))
    }

    /// Internal so tests can pass in small files.
    static func load(rootsData: Data, corpusData: Data) throws -> ConjugationService {
        let corpus = try JSONDecoder().decode(GoldenCorpus.self, from: corpusData)
        let actual = contentHash(of: rootsData)
        guard actual == corpus.rootsHash else {
            throw ConjugationError.corpusStale(expected: corpus.rootsHash, actual: actual)
        }

        let standIn = CorpusConjugator(corpus: corpus)
        var conjugators: [VerbTypeGroup: any VerbTypeConjugator] = [:]
        for group in VerbTypeGroup.allCases {
            switch engineBacking(for: group) {
            case .engine:  conjugators[group] = engines[group]
            case .corpus:  conjugators[group] = standIn
            case .unbuilt: break
            }
        }
        return try ConjugationService(conjugators: conjugators)
    }

    private static func bundledData(_ name: String) throws -> Data {
        guard let url = Bundle.module.url(forResource: name, withExtension: "json") else {
            throw ConjugationError.resourceMissing("\(name).json")
        }
        return try Data(contentsOf: url)
    }
}
