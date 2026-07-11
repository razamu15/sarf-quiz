// Loads and validates the bundled content (patterns.json + roots.json).
// Everything downstream — Conjugator, QuizGenerator — takes content from here.

import Foundation

public final class ContentStore {
    public let grammar: GrammarTables
    public let roots: [Root]

    // Bundle.module only exists when SwiftPM builds the package (it generates
    // the resource-bundle accessor). The direct-swiftc path used on
    // CLT-only machines loads from a directory instead — see build-and-test.sh.
    #if SWIFT_PACKAGE
    /// Loads content from the SarfCore package bundle. This is the entry point
    /// the app uses; tests use it too.
    public static func loadBundled() throws -> ContentStore {
        try ContentStore(bundle: Bundle.module)
    }
    #endif

    public init(bundle: Bundle) throws {
        self.grammar = try Self.decodeResource("patterns", as: GrammarTables.self, from: bundle)
        self.roots = try Self.decodeResource("roots", as: RootsFile.self, from: bundle).roots
        try grammar.validateCompleteness()
    }

    /// Loads content from a plain directory containing patterns.json and
    /// roots.json. Used by tooling and by the direct-swiftc test build.
    public init(resourcesDirectory: URL) throws {
        let decoder = JSONDecoder()
        func decode<T: Decodable>(_ name: String, as type: T.Type) throws -> T {
            let url = resourcesDirectory.appendingPathComponent("\(name).json")
            guard FileManager.default.fileExists(atPath: url.path) else {
                throw ContentError.resourceNotFound(url.path)
            }
            return try decoder.decode(T.self, from: Data(contentsOf: url))
        }
        self.grammar = try decode("patterns", as: GrammarTables.self)
        self.roots = try decode("roots", as: RootsFile.self).roots
        try grammar.validateCompleteness()
    }

    /// Verb types for which at least one root exists — drives which drill
    /// presets and picker chips are enabled.
    public var availableVerbTypes: Set<VerbType> {
        Set(roots.map(\.type))
    }

    public func root(withRadicals joined: String) -> Root? {
        roots.first { $0.joinedRadicals == joined }
    }

    // MARK: - Decoding

    private struct RootsFile: Decodable { let roots: [Root] }

    private static func decodeResource<T: Decodable>(_ name: String, as type: T.Type, from bundle: Bundle) throws -> T {
        guard let url = bundle.url(forResource: name, withExtension: "json") else {
            throw ContentError.resourceNotFound("\(name).json")
        }
        return try JSONDecoder().decode(T.self, from: Data(contentsOf: url))
    }
}
