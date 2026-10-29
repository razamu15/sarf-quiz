// S0.2 — the vocabulary on its own: pure, no files. The raw values and their order
// are a storage contract (Models/Vocabulary.swift), so each is pinned here as a
// literal; changing one is a test failure that says "this needs a migration".
// ExportedVocabularyTests checks the same enums against the exported JSON.

import Foundation
import Testing
@testable import SarfCore

@Suite("Vocabulary — raw values and order are pinned")
struct VocabularyPinTests {
    @Test func axes() {
        #expect(Tense.allCases.map(\.rawValue) == ["madi", "mudari", "amr"])
        #expect(Voice.allCases.map(\.rawValue) == ["malum", "majhul"])
        #expect(Mood.allCases.map(\.rawValue) == ["raf", "nasb", "jazm"])
    }

    /// Classic sarf-table order — the Tables screen iterates allCases.
    @Test func slots() {
        #expect(PronounSlot.allCases.map(\.rawValue) == [
            "3ms", "3md", "3mp", "3fs", "3fd", "3fp",
            "2ms", "2md", "2mp", "2fs", "2fd", "2fp",
            "1s", "1p",
        ])
    }

    @Test func forms() {
        #expect(VerbForm.allCases.map(\.rawValue) == ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"])
    }

    @Test func abwab() {
        #expect(Bab.allCases.map(\.rawValue) == ["au", "ai", "aa", "ia", "uu", "ii"])
    }

    @Test func derivedNouns() {
        #expect(DerivedNounType.allCases.map(\.rawValue) == ["ismFail", "ismMaful", "masdar"])
    }

    @Test func verbTypes() {
        #expect(VerbType.allCases.map(\.rawValue) == [
            "salim", "mahmuz", "mudaaf",
            "mithal_waw", "mithal_ya",
            "ajwaf_waw", "ajwaf_ya",
            "naqis_waw", "naqis_ya",
            "lafif_mafruq", "lafif_maqrun",
        ])
        #expect(VerbTypeGroup.allCases.map(\.rawValue) == [
            "salim", "mahmuz", "mudaaf", "mithal", "ajwaf", "naqis", "lafif",
        ])
    }
}

@Suite("Tense.slots")
struct SlotsTests {
    @Test func madiAndMudariHaveAllFourteen() {
        #expect(Tense.madi.slots == PronounSlot.allCases)
        #expect(Tense.mudari.slots == PronounSlot.allCases)
        #expect(Tense.madi.slots.count == 14)
    }

    @Test func amrHasTheSixSecondPersonSlots() {
        #expect(Tense.amr.slots.map(\.rawValue) == ["2ms", "2md", "2mp", "2fs", "2fd", "2fp"])
    }
}

@Suite("ChartShape — the single judge of the nine")
struct ChartShapeTests {
    @Test func theNineInOrder() {
        let written = ChartShape.all.map { "\($0.tense.rawValue)/\($0.voice.rawValue)/\($0.mood?.rawValue ?? "-")" }
        #expect(written == [
            "madi/malum/-", "madi/majhul/-",
            "mudari/malum/raf", "mudari/malum/nasb", "mudari/malum/jazm",
            "mudari/majhul/raf", "mudari/majhul/nasb", "mudari/majhul/jazm",
            "amr/malum/-",
        ])
    }

    /// `all` is a hand-written literal and the failable init is the judge; this
    /// is what stops them disagreeing. 3 tenses × 2 voices × (3 moods + none) = 24.
    @Test func theJudgeAcceptsExactlyTheNine() {
        let moods: [Mood?] = [nil] + Mood.allCases.map { Optional($0) }
        var accepted: [ChartShape] = []
        var tried = 0
        for tense in Tense.allCases {
            for voice in Voice.allCases {
                for mood in moods {
                    tried += 1
                    if let shape = ChartShape(tense: tense, voice: voice, mood: mood) { accepted.append(shape) }
                }
            }
        }
        #expect(tried == 24)
        #expect(accepted == ChartShape.all)
    }

    @Test func moodBelongsToTheMudariAlone() {
        #expect(ChartShape(tense: .madi, voice: .malum, mood: .raf) == nil)
        #expect(ChartShape(tense: .amr, voice: .malum, mood: .jazm) == nil)
        #expect(ChartShape(tense: .mudari, voice: .malum, mood: nil) == nil)
    }

    /// The case that bit the prototype: the parse card flips a drawn word's voice.
    @Test func theAmrHasNoPassive() {
        #expect(ChartShape(tense: .amr, voice: .majhul, mood: nil) == nil)
    }

    @Test func roundTripsWithAnExplicitNull() throws {
        let madi = try #require(ChartShape(tense: .madi, voice: .majhul, mood: nil))
        let json = try JSONEncoder.sorted.encode(madi)
        #expect(String(decoding: json, as: UTF8.self) == #"{"mood":null,"tense":"madi","voice":"majhul"}"#)
        #expect(try JSONDecoder().decode(ChartShape.self, from: json) == madi)

        for shape in ChartShape.all {
            #expect(try JSONDecoder().decode(ChartShape.self, from: JSONEncoder().encode(shape)) == shape)
        }
    }

    @Test func decodingRefusesWhatTheInitRefuses() {
        let amrPassive = #"{"tense":"amr","voice":"majhul","mood":null}"#
        #expect(throws: DecodingError.self) { try JSONDecoder().decode(ChartShape.self, from: Data(amrPassive.utf8)) }
        let unknownTense = #"{"tense":"future","voice":"malum","mood":null}"#
        #expect(throws: DecodingError.self) { try JSONDecoder().decode(ChartShape.self, from: Data(unknownTense.utf8)) }
    }

    /// Absent is a stale file; null is a māḍī. They must not decode alike.
    @Test func aMissingMoodKeyIsAnError() {
        let missing = #"{"tense":"madi","voice":"malum"}"#
        #expect(throws: DecodingError.self) { try JSONDecoder().decode(ChartShape.self, from: Data(missing.utf8)) }
    }
}

@Suite("Bab and Haraka")
struct BabTests {
    @Test func harakatAreTheCombiningMarks() {
        #expect(Haraka.allCases.map(\.scalar.value) == [0x064E, 0x064F, 0x0650])
        for haraka in Haraka.allCases {
            #expect(haraka.scalar.properties.generalCategory == .nonspacingMark)
        }
    }

    /// The pairs from the type's doc comment, written out a second time on purpose.
    @Test func eachBabDeclaresItsPair() {
        let expected: [Bab: (Haraka, Haraka)] = [
            .au: (.fatha, .damma), .ai: (.fatha, .kasra), .aa: (.fatha, .fatha),
            .ia: (.kasra, .fatha), .uu: (.damma, .damma), .ii: (.kasra, .kasra),
        ]
        #expect(expected.count == Bab.allCases.count)
        for bab in Bab.allCases {
            #expect(bab.madiVowel == expected[bab]?.0)
            #expect(bab.mudariVowel == expected[bab]?.1)
        }
    }

    /// The raw value is the vowel pair spelled in letters; what it spells and what
    /// `vowels` declares must agree (the prototype's BAB_ID_LETTER check).
    @Test func theIdSpellsTheDeclaredVowels() throws {
        let letterToHaraka: [Character: Haraka] = ["a": .fatha, "u": .damma, "i": .kasra]
        for bab in Bab.allCases {
            let letters = Array(bab.rawValue)
            #expect(letters.count == 2)
            #expect(letterToHaraka[letters[0]] == bab.madiVowel)
            #expect(letterToHaraka[letters[1]] == bab.mudariVowel)
        }
    }
}

@Suite("VerbType and VerbTypeGroup")
struct VerbTypeTests {
    /// Each engine type is in exactly one group, and the groups together cover all.
    @Test func groupsPartitionTheTypes() {
        let covered = VerbTypeGroup.allCases.flatMap(\.verbTypes)
        #expect(covered.count == VerbType.allCases.count)
        #expect(Set(covered) == Set(VerbType.allCases))
        for group in VerbTypeGroup.allCases {
            #expect(!group.verbTypes.isEmpty)
            for type in group.verbTypes { #expect(type.group == group) }
        }
    }

    /// The five groups that cover more than one engine type each cover exactly the
    /// pair the domain says; the rest are one type, one group.
    @Test func eachGroupCoversExactlyItsEngineTypes() {
        #expect(VerbTypeGroup.mithal.verbTypes == [.mithalWaw, .mithalYa])
        #expect(VerbTypeGroup.ajwaf.verbTypes == [.ajwafWaw, .ajwafYa])
        #expect(VerbTypeGroup.naqis.verbTypes == [.naqisWaw, .naqisYa])
        // Lafīf's pair differs by position of the weak letters, not by which letter.
        #expect(VerbTypeGroup.lafif.verbTypes == [.lafifMafruq, .lafifMaqrun])
        #expect(VerbTypeGroup.salim.verbTypes == [.salim])
        #expect(VerbTypeGroup.mahmuz.verbTypes == [.mahmuz])
        #expect(VerbTypeGroup.mudaaf.verbTypes == [.mudaaf])
    }

    /// Cross-check of the per-case `group` against the naming convention.
    @Test func everyTypeIsNamedForItsGroup() {
        for type in VerbType.allCases {
            #expect(type.rawValue.hasPrefix(type.group.rawValue))
        }
    }
}

private extension JSONEncoder {
    static var sorted: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        return encoder
    }
}
