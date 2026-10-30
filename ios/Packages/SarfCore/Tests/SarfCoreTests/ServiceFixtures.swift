// Shared by the conjugation tests: a stand-in conjugator, a service built from
// stand-ins, and small roots made in code.

import Foundation
@testable import SarfCore

/// Answers with a marker word that says who answered, and records what it was
/// asked, so a test can see where a call went and whether it reached an engine.
final class StubConjugator: VerbTypeConjugator, @unchecked Sendable {
    let name: String
    private let recognition: String?
    private let returnsEmptyTable: Bool
    private let lock = NSLock()
    private var log: [String] = []
    private var specs: [ConjugationSpec] = []

    init(_ name: String, recognition: String? = nil, returnsEmptyTable: Bool = false) {
        self.name = name
        self.recognition = recognition
        self.returnsEmptyTable = returnsEmptyTable
    }

    /// What was called, in order: "conjugate", "table", "derived", "recognition".
    var calls: [String] {
        lock.lock(); defer { lock.unlock() }
        return log
    }

    /// The spec of the most recent conjugate or table call.
    var lastSpec: ConjugationSpec? {
        lock.lock(); defer { lock.unlock() }
        return specs.last
    }

    private func record(_ call: String, _ spec: ConjugationSpec? = nil) {
        lock.lock(); defer { lock.unlock() }
        log.append(call)
        if let spec { specs.append(spec) }
    }

    func conjugate(_ spec: ConjugationSpec, slot: PronounSlot) -> String? {
        record("conjugate", spec)
        return "\(name):\(spec.form.rawValue):\(spec.tense.rawValue):\(spec.voice.rawValue):\(slot.rawValue)"
    }

    func conjugateTable(_ spec: ConjugationSpec) -> [PronounSlot: String] {
        record("table", spec)
        if returnsEmptyTable { return [:] }
        return Dictionary(uniqueKeysWithValues: spec.tense.slots.map { ($0, "\(name):\($0.rawValue)") })
    }

    func derivedNoun(root: Root, form: VerbForm, type: DerivedNounType) -> String? {
        record("derived")
        return "\(name):\(form.rawValue):\(type.rawValue)"
    }

    func recognitionCitation(root: Root, form: VerbForm) -> String? {
        record("recognition")
        return recognition
    }
}

/// A service whose every built group is a `StubConjugator`.
struct Rig {
    let service: ConjugationService
    let stubs: [VerbTypeGroup: StubConjugator]

    init(recognition: [VerbTypeGroup: String] = [:], emptyTables: Set<VerbTypeGroup> = []) throws {
        var stubs: [VerbTypeGroup: StubConjugator] = [:]
        for group in VerbTypeGroup.allCases where engineBacking(for: group) != .unbuilt {
            stubs[group] = StubConjugator(
                group.rawValue, recognition: recognition[group], returnsEmptyTable: emptyTables.contains(group))
        }
        self.stubs = stubs
        service = try ConjugationService(conjugators: stubs)
    }

    func stub(_ group: VerbTypeGroup) -> StubConjugator { stubs[group]! }

    /// Every call made to any stub.
    var allCalls: [String] { stubs.values.flatMap(\.calls) }
}

/// A root made in code. `forms` maps each form it is used in to whether the verb
/// takes an object there.
func testRoot(_ letters: String, _ type: VerbType, forms: [VerbForm: Bool], bab: Bab? = .au) -> Root {
    let scalars = Array(letters.unicodeScalars)
    var rootForms: [VerbForm: RootForm] = [:]
    for (form, isTransitive) in forms {
        rootForms[form] = RootForm(
            bab: form == .i ? bab : nil, isTransitive: isTransitive,
            masdar: form == .i ? "مَصْدَر" : nil, faaDrops: nil, gloss: "to test", english: nil)
    }
    return Root(radicals: Radicals(fa: scalars[0], ayn: scalars[1], lam: scalars[2]), verbType: type, forms: rootForms)
}

/// The charts the tests need by name.
enum Shapes {
    static let madiActive = ChartShape.madiMalum
    static let madiPassive = pick(.madi, .majhul, nil)
    static let mudariActiveRaf = ChartShape.mudariMalumRaf
    static let mudariPassiveRaf = pick(.mudari, .majhul, .raf)
    static let amr = pick(.amr, .malum, nil)

    private static func pick(_ tense: Tense, _ voice: Voice, _ mood: Mood?) -> ChartShape {
        ChartShape.all.first { $0.tense == tense && $0.voice == voice && $0.mood == mood }!
    }
}
