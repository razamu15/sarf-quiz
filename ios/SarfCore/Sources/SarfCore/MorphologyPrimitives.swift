// The vocabulary of Arabic morphology, as Swift enums.
//
// Everything in this file is a closed grammatical category — these never grow
// with content. Raw values match the JSON content schema (and the web
// prototype's data files), so they double as coding keys.

import Foundation

/// The ten forms of the triliteral verb: Form I (thulāthī mujarrad) plus the
/// nine mazīd fīhi forms II–X.
public enum FormID: String, Codable, CaseIterable {
    case I, II, III, IV, V, VI, VII, VIII, IX, X

    /// Forms II–X (everything with added letters).
    public static let mazeedForms: [FormID] = allCases.filter { $0 != .I }
}

/// Verb tense/type: past, present-future, command.
public enum Tense: String, Codable, CaseIterable {
    case madi, mudari, amr
}

/// Whether the doer is known (active) or unknown (passive).
public enum Voice: String, Codable, CaseIterable {
    case malum, majhul
}

/// Iʿrāb state of the muḍāriʿ. `raf` is the default; naṣb follows أَنْ/لَنْ…,
/// jazm follows لَمْ/لَا النَّاهِيَة…. Māḍī and amr have no mood.
public enum Mood: String, Codable, CaseIterable {
    case raf, nasb, jazm
}

/// Classification of the root by its weak/doubled letters.
public enum VerbType: String, Codable, CaseIterable {
    case salim      // sound — fully engine-conjugated
    case mahmuz     // contains hamza
    case mudaaf     // doubled second/third radical
    case mithal     // weak first radical
    case ajwaf      // weak middle radical (hollow)
    case naqis      // weak final radical (defective)
    case lafif      // two weak radicals
}

/// The six abwāb of Form I, named by their exemplar verbs. The bāb is the pair
/// of ʿayn-vowels: (māḍī vowel, muḍāriʿ vowel) — e.g. naṣara = fatḥa/ḍamma.
public enum Bab: Int, Codable, CaseIterable {
    case nasara = 1   // نَصَرَ يَنْصُرُ  fatḥa / ḍamma
    case daraba = 2   // ضَرَبَ يَضْرِبُ  fatḥa / kasra
    case fataha = 3   // فَتَحَ يَفْتَحُ  fatḥa / fatḥa
    case samia  = 4   // سَمِعَ يَسْمَعُ  kasra / fatḥa
    case karuma = 5   // كَرُمَ يَكْرُمُ  ḍamma / ḍamma
    case hasiba = 6   // حَسِبَ يَحْسِبُ  kasra / kasra
}

/// One cell of the classic 14-row conjugation table, named by its pronoun and
/// listed in traditional recitation order (3rd person → 2nd → 1st).
/// Raw values are the compact person-gender-number codes used in the content
/// files: "3ms" = third person, masculine, singular, and so on.
public enum PronounSlot: String, Codable, CaseIterable {
    case _3ms    = "3ms"   // هُوَ
    case _3md   = "3md"   // هُمَا (two men)
    case _3mp     = "3mp"   // هُمْ
    case _3fs    = "3fs"   // هِيَ
    case _3fd   = "3fd"   // هُمَا (two women)
    case _3fp   = "3fp"   // هُنَّ
    case _2ms    = "2ms"   // أَنْتَ
    case _2md = "2md"   // أَنْتُمَا (two men)
    case _2mp   = "2mp"   // أَنْتُمْ
    case _2fs    = "2fs"   // أَنْتِ
    case _2fd = "2fd"   // أَنْتُمَا (two women)
    case _2fp = "2fp"   // أَنْتُنَّ
    case _1s     = "1s"    // أَنَا
    case _1p   = "1p"    // نَحْنُ
}

/// The three derived nouns supported at launch.
public enum DerivedNounKind: String, Codable, CaseIterable {
    case ismFail    // doer noun (فَاعِل / مُفَعِّل …)
    case ismMaful   // receiver noun (مَفْعُول / مُفَعَّل …)
    case masdar     // verbal noun (samāʿī for Form I, template for II–X)
}

/// What a quiz question is testing. Mirrors the prototype's categories.
public enum QuestionCategory: String, Codable, CaseIterable {
    case tense, voice, doer, wazn, mood, bab, root, derived, meaning
}

// MARK: - Internal string helpers

extension String {
    /// NFC normalization. Combining marks (ḥaraka vs. shadda) can be encoded in
    /// either order depending on how text was typed or templated; NFC gives one
    /// canonical order so string equality works everywhere. Every Arabic string
    /// the engine emits passes through this.
    var nfcNormalized: String {
        precomposedStringWithCanonicalMapping
    }
}
