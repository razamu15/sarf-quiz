// Loads roots.json, checks it, and answers questions about the roots.

import Foundation

/// Why the lexicon failed to load. Problems in the file itself (a missing field,
/// an unknown type or form, a root without three letters) come through as a
/// `DecodingError` instead.
public enum LexiconError: Error, Equatable, CustomStringConvertible {
    /// roots.json isn't in the bundle.
    case resourceMissing
    /// A root's declared type doesn't match what its letters imply.
    case typeMismatch(root: String, declared: VerbType, implied: VerbType)
    /// Two entries have the same letters.
    case duplicateRoot(String)
    /// A form other than I has a bab.
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

/// The lexicon: every root, in file order, and lookups over them.
///
/// Used by: AppModel (loads it once and shares it), ConjugationService, the
/// Tables screen, the quiz word pool.
public struct LexiconService: Sendable {
    public let roots: [Root]
    private let rootsByKey: [String: Root]

    /// Loads the roots.json bundled with the app.
    public static func load() throws -> LexiconService {
        guard let url = Bundle.module.url(forResource: "roots", withExtension: "json") else {
            throw LexiconError.resourceMissing
        }
        return try load(from: Data(contentsOf: url))
    }

    /// Decodes and checks a lexicon. Fails if:
    ///   - a root doesn't have exactly three letters, or has an unknown type or form
    ///   - its declared type isn't the one its letters imply
    ///   - two roots have the same letters
    ///   - a form other than I has a bab
    /// The rest of the app assumes all of this holds. (A Form I with no bab is
    /// allowed; it just has no bab.)
    ///
    /// Internal so tests can pass in small files.
    static func load(from data: Data) throws -> LexiconService {
        let file = try JSONDecoder().decode(RootsFile.self, from: data)
        var byKey: [String: Root] = [:]
        for root in file.roots {
            let implied = classify(root.radicals)
            guard implied == root.verbType else {
                throw LexiconError.typeMismatch(root: root.key, declared: root.verbType, implied: implied)
            }
            guard byKey[root.key] == nil else { throw LexiconError.duplicateRoot(root.key) }
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

    /// The root with these letters ("كتب"), or nil if there isn't one. Nil can
    /// happen for a root saved in history that has since been removed.
    ///
    /// Used by: history replay, the Tables screen.
    public func root(forKey key: String) -> Root? {
        rootsByKey[key]
    }

    /// Every verb type that has at least one root, in the order they first appear.
    ///
    /// Used by: the Practice screen, to know which types exist.
    public var stockedTypes: [VerbType] {
        var seen = Set<VerbType>()
        return roots.map(\.verbType).filter { seen.insert($0).inserted }
    }

    /// Every (root, form) pair whose root is one of `types` and whose form is one
    /// of `forms`. Roots come in file order, and forms in order I to X.
    ///
    /// Used by: the quiz word pool.
    public func candidates(types: Set<VerbType>, forms: Set<VerbForm>) -> [RootForm] {
        roots.filter { types.contains($0.verbType) }.flatMap { root in
            root.recordedForms.filter { forms.contains($0) }.map { RootForm(root: root, form: $0) }
        }
    }
}
