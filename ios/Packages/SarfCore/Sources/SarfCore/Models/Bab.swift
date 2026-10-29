// The six abwāb of Form I, and the three short vowels they are made of. Port of
// BAB_IDS / ABWAB / BAB_ID_LETTER in web-prototype/js/vocabulary.js.

/// A short vowel (ḥaraka): fatḥa, ḍamma, kasra — the only three a bāb can carry.
///
/// The sukūn is deliberately not a case: it is the ABSENCE of a ḥaraka, and no
/// bāb has one. It arrives with the template code (S0.7), which is the first
/// thing that writes one into a word, as a plain scalar constant.
///
/// Called by: `Bab.madiVowel` / `mudariVowel` below; the grammar tables and
/// Templates (S0.7), which spell stems out in scalars and read `scalar` here.
public enum Haraka: CaseIterable, Sendable {
    case fatha, damma, kasra

    /// The real combining mark, not a letter, so it can be appended straight onto
    /// a word without a second mapping.
    public var scalar: Unicode.Scalar {
        switch self {
        case .fatha: return "\u{064E}"
        case .damma: return "\u{064F}"
        case .kasra: return "\u{0650}"
        }
    }
}

/// The six abwāb of the thulāthī mujarrad (Form I), named by the vowel pair that
/// IS the bāb: the ʿayn's ḥaraka in the māḍī, then in the muḍāriʿ.
///
///     au  نَصَرَ يَنْصُرُ   fatḥa / ḍamma      ia  سَمِعَ يَسْمَعُ   kasra / fatḥa
///     ai  ضَرَبَ يَضْرِبُ   fatḥa / kasra      uu  كَرُمَ يَكْرُمُ   ḍamma / ḍamma
///     aa  فَتَحَ يَفْتَحُ   fatḥa / fatḥa      ii  حَسِبَ يَحْسِبُ   kasra / kasra
///
/// The raw value spells the pair (`ia` = kasra then fatḥa) and `vowels` DECLARES
/// it, so the claim is checkable: VocabularyTests asserts that each raw value's
/// two letters agree with the declared vowels, rather than the agreement being a
/// convention a reader has to know. The stem tables in Grammar/ still spell the
/// vowels out in their literals — they do not read this — and must keep doing so,
/// because that is what lets them be audited against a paper chart.
///
/// A bāb belongs to Form I only. The lexicon records one per Form I usage, and a
/// root's mazīd forms have none; an absent bāb stays absent (`nil`) all the way
/// to the engine, which answers "no word" rather than assume نَصَرَ. The
/// prototype's DEFAULT_BAB is deliberately not ported — see IOS_PORT_PLAN
/// follow-ups.
///
/// Raw values are a storage contract (see Vocabulary.swift): a bāb is written
/// into every stored WordSpec of a Form I word, as a key, never as a reference.
///
/// Called by: RootFormUsage.bab (S0.3); ConjugationService's Form I precondition
/// (S0.5); each Form I engine, to pick its stems; Glossary (SarfQuiz) to name the
/// pair in English.
public enum Bab: String, CaseIterable, Codable, Sendable {
    case au, ai, aa, ia, uu, ii

    /// The ʿayn's ḥaraka in the (madi, mudari) — the bāb itself, declared per case.
    public var vowels: (madi: Haraka, mudari: Haraka) {
        switch self {
        case .au: return (.fatha, .damma)
        case .ai: return (.fatha, .kasra)
        case .aa: return (.fatha, .fatha)
        case .ia: return (.kasra, .fatha)
        case .uu: return (.damma, .damma)
        case .ii: return (.kasra, .kasra)
        }
    }

    public var madiVowel: Haraka { vowels.madi }
    public var mudariVowel: Haraka { vowels.mudari }
}
