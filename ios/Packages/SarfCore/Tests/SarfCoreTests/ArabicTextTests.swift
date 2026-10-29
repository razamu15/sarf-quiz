// Tests for ArabicText. The expected values for the named words were taken from
// the JavaScript version's output.

import Foundation
import Testing
@testable import SarfCore

private func clusterStrings(_ word: String) -> [String] {
    ArabicText.clusters(word).map { String($0) }
}

@Suite("ArabicText.clusters")
struct ClustersTests {
    @Test func aLetterAndItsMarksAreOneCluster() {
        #expect(clusterStrings("تُنْصَرَانِ") == ["تُ", "نْ", "صَ", "رَ", "ا", "نِ"])
        #expect(clusterStrings("اِسْتَخْرَجَ") == ["اِ", "سْ", "تَ", "خْ", "رَ", "جَ"])
        #expect(clusterStrings("أَنْتُمَا") == ["أَ", "نْ", "تُ", "مَ", "ا"])
    }

    /// A shadda and a vowel on the same letter stay together.
    @Test func shaddaAndVowelStayTogether() {
        #expect(clusterStrings("يُعَلِّمُ") == ["يُ", "عَ", "لِّ", "مُ"])
        #expect(clusterStrings("ق\u{0651}\u{064E}") == ["قَّ"])
    }

    @Test func spacesAreTheirOwnCluster() {
        #expect(clusterStrings("لَمْ تَسْلَمَا") == ["لَ", "مْ", " ", "تَ", "سْ", "لَ", "مَ", "ا"])
    }

    @Test func emptyWordHasNoClusters() {
        #expect(ArabicText.clusters("").isEmpty)
    }

    /// Over every word the engines produce: the clusters rebuild the word, and
    /// each is one letter followed only by marks.
    @Test func everyCorpusWordSplitsIntoLettersWithMarks() throws {
        let words = try corpusWords()
        #expect(!words.isEmpty)
        for word in words {
            let clusters = ArabicText.clusters(word)
            #expect(String(clusters) == word, "\(word)")
            for cluster in clusters {
                let scalars = Array(cluster.unicodeScalars)
                let base = scalars[0].properties.generalCategory
                #expect(base == .otherLetter || base == .spaceSeparator, "\(word)")
                for mark in scalars.dropFirst() {
                    #expect(mark.properties.generalCategory == .nonspacingMark, "\(word)")
                }
            }
        }
    }
}

@Suite("ArabicText.firstDifferingCluster")
struct FirstDifferingClusterTests {
    /// The last letter's vowel differs. Counting raw characters would give 10, a
    /// bare fatha with no letter; counting clusters gives the letter, 5.
    @Test func pointsAtTheLetterNotTheLooseMark() {
        let typed = "تُنْصَرَانَ"
        let expected = "تُنْصَرَانِ"
        #expect(ArabicText.firstDifferingCluster(typed, expected) == 5)

        let firstDifferentScalar = zip(typed.unicodeScalars, expected.unicodeScalars)
            .enumerated().first { $0.element.0 != $0.element.1 }?.offset
        #expect(firstDifferentScalar == 10)
    }

    @Test func sameWordsAreNil() {
        #expect(ArabicText.firstDifferingCluster("نَصَرَ", "نَصَرَ") == nil)
        #expect(ArabicText.firstDifferingCluster("", "") == nil)
    }

    /// One word is the start of the other: the answer is where the shorter ends.
    @Test func aPrefixDiffersWhereTheShorterEnds() {
        #expect(ArabicText.firstDifferingCluster("نَصَرَ", "نَصَرَا") == 3)
        #expect(ArabicText.firstDifferingCluster("نَصَرَا", "نَصَرَ") == 3)
        #expect(ArabicText.firstDifferingCluster("", "نَ") == 0)
    }

    @Test func aDifferentFirstLetterIsZero() {
        #expect(ArabicText.firstDifferingCluster("نَصَرَ", "كَتَبَ") == 0)
    }

    /// Shadda-then-fatha and fatha-then-shadda are the same letter. The
    /// JavaScript version called these different unless both were normalised
    /// first; Swift does not need that step.
    @Test func marksInADifferentOrderAreTheSame() {
        let shaddaFirst = "ق\u{0651}\u{064E}"
        let fathaFirst = "ق\u{064E}\u{0651}"
        #expect(shaddaFirst.unicodeScalars.map(\.value) != fathaFirst.unicodeScalars.map(\.value))
        #expect(ArabicText.firstDifferingCluster(shaddaFirst, fathaFirst) == nil)
    }
}
