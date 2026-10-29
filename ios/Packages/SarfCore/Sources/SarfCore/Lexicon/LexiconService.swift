// Loads, validates and queries the lexicon. Port of web-prototype/js/lexicon/
// lexicon-service.js, minus `availableTypes` (see below).
//
// The prototype validated at module load by throwing at top level. Swift has no
// module-init phase that can fail, so the same check is `load()` — called once
// from AppModel (S1.2) — and a unit test calls it too, so a content typo fails in
// CI rather than at first launch (PORT_INVENTORY §1.10).
//
// NOT HERE YET: `availableTypes(enabled:)` and the content gates. "Is this verb
// type playable" is "in the lexicon AND served by an engine AND behind an open
// gate"; the middle clause is ConjugationService's `hasEngine`, which does not
// exist until S0.5, so the function lands there — it stays the single owner of
// that question, as in the JS. The gate table is data about groups and goes with
// it: lafīf is now ONE gate on ONE group, where the JS mapped two groups onto one
// gate. IOS_PORT_PLAN 0.5 owns it.

import Foundation

/// Why a lexicon failed to load. Anything that is not one of these is a
/// `DecodingError` from the file itself (a missing field, an unknown type or
/// form, a root without exactly three radicals).
public enum LexiconError: Error, Equatable, CustomStringConvertible {
    /// roots.json is not in the SarfCore bundle — a packaging error.
    case resourceMissing
    /// A root declares one verb type and its radicals imply another. Classification
    /// is mechanical, so this is a content bug that must fail loudly here rather
    /// than silently misroute the root to the wrong conjugator.
    case typeMismatch(root: String, declared: VerbType, implied: VerbType)
    /// Two entries have the same radicals. `root(forKey:)` would silently return
    /// the first, and a stored rootKey would be ambiguous.
    case duplicateRoot(String)
    /// A mazīd form carries a bāb. The abwāb belong to Form I alone.
    case babOnMazeedForm(root: String, form: VerbForm)

    public var description: String {
        switch self {
        case .resourceMissing:
            return "lexicon: roots.json is missing from the SarfCore bundle"
        case let .typeMismatch(root, declared, implied):
            return "lexicon: root \(root) declares type \"\(declared.rawValue)\" but its radicals imply \"\(implied.rawValue)\""
        case let .duplicateRoot(root):
            return "lexicon: root \(root) appears more than once"
        case let .babOnMazeedForm(root, form):
            return "lexicon: root \(root) records a bāb on Form \(form.rawValue); only Form I has one"
        }
    }
}

/// The validated lexicon: every root, in file order, and the queries over them.
///
/// File order is VISIBLE — the Tables browser lists roots in it — so `roots` keeps
/// it, and roots.json is written in lexicon order by the exporter.
///
/// Called by: AppModel (S1.2), which builds exactly one with `load()` and hands it
/// to ConjugationService and to every model that needs roots; tests, which build
/// small ones with `load(from:)`.
public struct LexiconService: Sendable {
    public let roots: [Root]
    private let rootsByKey: [String: Root]

    /// Reads the bundled roots.json. Throws if it is missing, malformed, or fails
    /// any check in `load(from:)`.
    public static func load() throws -> LexiconService {
        guard let url = Bundle.module.url(forResource: "roots", withExtension: "json") else {
            throw LexiconError.resourceMissing
        }
        return try load(from: Data(contentsOf: url))
    }

    /// THE validation boundary for the lexicon. Everything downstream — the
    /// engines, the quiz, the screens — assumes what is checked here and does not
    /// recheck it:
    ///   · every root has three single-letter radicals, a known verb type, and only
    ///     known forms (the decoder: `Radicals`, `Root`);
    ///   · its declared type is the one its radicals imply (`classify`);
    ///   · no two entries share radicals;
    ///   · only Form I carries a bāb.
    /// What is deliberately NOT checked: that a Form I has a bāb, or that `faaDrops`
    /// appears only where it means something. The first is a gap the engine
    /// answers as "no word"; the second is content the JS also left unenforced.
    ///
    /// Internal: the app only ever loads the bundled file; tests pass fixtures.
    static func load(from data: Data) throws -> LexiconService {
        let file = try JSONDecoder().decode(RootsFile.self, from: data)
        var byKey: [String: Root] = [:]
        for root in file.roots {
            let implied = classify(root.radicals)
            guard implied == root.verbType else {
                throw LexiconError.typeMismatch(root: root.key, declared: root.verbType, implied: implied)
            }
            guard byKey[root.key] == nil else { throw LexiconError.duplicateRoot(root.key) }
            // `recordedForms`, not `forms`: when a root has several problems the
            // same one is reported every time.
            for form in root.recordedForms where form != .i && root.bab(for: form) != nil {
                throw LexiconError.babOnMazeedForm(root: root.key, form: form)
            }
            byKey[root.key] = root
        }
        return LexiconService(roots: file.roots, rootsByKey: byKey)
    }

    private struct RootsFile: Decodable {
        let roots: [Root]
    }

    private init(roots: [Root], rootsByKey: [String: Root]) {
        self.roots = roots
        self.rootsByKey = rootsByKey
    }

    /// The root with these radicals ("كتب"), or `nil`.
    ///
    /// `nil` is a real answer, not an error: a stored rootKey outlives the lexicon
    /// that wrote it, so a root can be removed or reclassified after a history
    /// record names it. Replay, stats drill-down and "see the full table" each have
    /// to say what they do then (PORT_INVENTORY §3.3d).
    ///
    /// Called by: SarfQuiz's replay (S6) and the Tables screen (S1) to turn a
    /// stored key back into a live root.
    public func root(forKey key: String) -> Root? {
        rootsByKey[key]
    }

    /// Every verb type the lexicon has content for, playable or not, in the order
    /// each first appears. Called by: the content-gate check at S1.1, which must
    /// know what exists before deciding what is released.
    public var stockedTypes: [VerbType] {
        var seen = Set<VerbType>()
        return roots.map(\.verbType).filter { seen.insert($0).inserted }
    }

    /// Every (root, form) pair whose root is one of `types` and whose form is one
    /// of `forms` — lexicon order, then Form I … X within a root.
    ///
    /// Called by: SarfQuiz's WordPool (S3), which draws a quiz's words from the
    /// plan's rootFilter. The caller passes ENGINE types (`VerbType`, already
    /// expanded from the chips a student picked), never groups.
    public func candidates(types: Set<VerbType>, forms: Set<VerbForm>) -> [RootForm] {
        roots.filter { types.contains($0.verbType) }.flatMap { root in
            root.recordedForms.filter { forms.contains($0) }.map { RootForm(root: root, form: $0) }
        }
    }
}
