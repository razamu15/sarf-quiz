// Shared by the tests that read the bundled JSON files.

import Foundation
@testable import SarfCore

struct MissingResource: Error { let name: String }

/// Reads one of the bundled JSON files. SwiftPM puts them at the top of the
/// bundle, so there is no subdirectory.
func resource(_ name: String) throws -> Data {
    guard let url = Bundle.module.url(forResource: name, withExtension: "json") else {
        throw MissingResource(name: name)
    }
    return try Data(contentsOf: url)
}

/// Every Arabic word in the golden corpus: citations, derived nouns and chart words.
func corpusWords() throws -> [String] {
    var words: [String] = []
    func collect(_ node: Any, key: String?) {
        if let text = node as? String, key != "rootsHash", key != "tense", key != "voice", key != "mood", key != "form", key != "bab" {
            words.append(text)
        } else if let dictionary = node as? [String: Any] {
            for (childKey, child) in dictionary { collect(child, key: childKey) }
        } else if let array = node as? [Any] {
            for child in array { collect(child, key: key) }
        }
    }
    let corpus = try JSONSerialization.jsonObject(with: resource("golden-corpus"))
    // Only the parts that hold words: root-form blocks and the wazn entries.
    if let top = corpus as? [String: Any] {
        collect(top["roots"] ?? [:], key: nil)
        collect(top["wazn"] ?? [], key: nil)
    }
    return words
}
