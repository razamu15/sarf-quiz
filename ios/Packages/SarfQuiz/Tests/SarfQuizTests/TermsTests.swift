// The names the screens label things with. Each is typed out here from the
// design, so a changed word shows.

import SarfCore
import Testing
@testable import SarfQuiz

@Suite("Terms")
struct TermsTests {
    @Test func tenses() {
        #expect(Tense.madi.term == Term("māḍī", "مَاضٍ"))
        #expect(Tense.mudari.term == Term("muḍāriʿ", "مُضَارِع"))
        #expect(Tense.amr.term == Term("amr", "أَمْر"))
    }

    @Test func voices() {
        #expect(Voice.malum.term == Term("maʿrūf", "مَعْرُوف"))
        #expect(Voice.majhul.term == Term("majhūl", "مَجْهُول"))
    }

    @Test func moods() {
        #expect(Mood.raf.term == Term("marfūʿ", "مَرْفُوع"))
        #expect(Mood.nasb.term == Term("manṣūb", "مَنْصُوب"))
        #expect(Mood.jazm.term == Term("majzūm", "مَجْزُوم"))
    }

    @Test func verbTypeGroups() {
        let expected: [VerbTypeGroup: Term] = [
            .salim: Term("Sound", "سَالِم"),
            .mahmuz: Term("Hamzated", "مَهْمُوز"),
            .mudaaf: Term("Doubled", "مُضَاعَف"),
            .mithal: Term("Assimilated", "مِثَال"),
            .ajwaf: Term("Hollow", "أَجْوَف"),
            .naqis: Term("Defective", "نَاقِص"),
            .lafif: Term("Lafīf", "لَفِيف"),
        ]
        #expect(VerbTypeGroup.allCases.count == expected.count)
        for group in VerbTypeGroup.allCases {
            #expect(group.term == expected[group], "\(group)")
        }
    }

    /// Two ideas with one name would be one chip twice.
    @Test func noTwoTermsOfASetShareAName() {
        func distinct(_ terms: [Term]) -> Bool {
            Set(terms.map(\.english)).count == terms.count && Set(terms.map(\.arabic)).count == terms.count
        }
        #expect(distinct(Tense.allCases.map(\.term)))
        #expect(distinct(Voice.allCases.map(\.term)))
        #expect(distinct(Mood.allCases.map(\.term)))
        #expect(distinct(VerbTypeGroup.allCases.map(\.term)))
    }

    /// The Arabic half is the bare word. "فِعْل" in front of it belongs to a sentence, not the name.
    @Test func arabicHalvesAreOneWord() {
        let all = Tense.allCases.map(\.term) + Voice.allCases.map(\.term)
            + Mood.allCases.map(\.term) + VerbTypeGroup.allCases.map(\.term)
        #expect(all.allSatisfy { !$0.arabic.contains(" ") })
    }
}
