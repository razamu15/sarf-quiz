// SarfCore engine test suite — ported 1:1 from web-prototype/test/smoke.mjs
// (same inputs, same hand-typed expected strings, same 125-assertion count).
//
// Runs as an executable because this machine has Command Line Tools only;
// the assertions move into XCTest unchanged once the Xcode project exists.
//
//   swift run SarfSmokeTests

import Foundation
#if SWIFT_PACKAGE
import SarfCore   // direct-swiftc builds compile everything as one module
#endif

// MARK: - Tiny assertion harness

final class TestRun {
    private(set) var passed = 0
    private(set) var failed = 0

    /// Compares NFC-normalized so combining-mark order can never cause a
    /// false failure (the expected strings here are hand-typed).
    func expect(_ got: String?, _ want: String?, line: Int = #line) {
        let g = got?.precomposedStringWithCanonicalMapping
        let w = want?.precomposedStringWithCanonicalMapping
        if g == w { passed += 1; return }
        failed += 1
        print("FAIL (line \(line)): got \(g ?? "nil") want \(w ?? "nil")")
        if let g, let w {
            print("  got : \(g.unicodeScalars.map { String($0.value, radix: 16) }.joined(separator: " "))")
            print("  want: \(w.unicodeScalars.map { String($0.value, radix: 16) }.joined(separator: " "))")
        }
    }

    func expectTrue(_ condition: Bool, _ label: String, line: Int = #line) {
        if condition { passed += 1 } else {
            failed += 1
            print("FAIL (line \(line)): \(label)")
        }
    }

    func finish() -> Never {
        print("\n\(passed) passed, \(failed) failed")
        exit(failed == 0 ? 0 : 1)
    }
}

let run = TestRun()

// MARK: - Setup

let content: ContentStore
do {
    #if SWIFT_PACKAGE
    content = try ContentStore.loadBundled()
    #else
    // Direct-swiftc build (CLT-only machines): the resources directory is
    // passed as the first argument by build-and-test.sh.
    let resourcesPath = CommandLine.arguments.count > 1
        ? CommandLine.arguments[1]
        : "Sources/SarfCore/Resources"
    content = try ContentStore(resourcesDirectory: URL(fileURLWithPath: resourcesPath))
    #endif
} catch {
    print("FATAL: could not load content — \(error)")
    exit(1)
}
let conjugator = Conjugator(grammar: content.grammar)
let meanings = MeaningRenderer(grammar: content.grammar)
let generator = QuizGenerator(content: content)

func root(_ joinedRadicals: String) -> Root {
    guard let r = content.root(withRadicals: joinedRadicals) else {
        print("FATAL: missing root \(joinedRadicals)")
        exit(1)
    }
    return r
}

func conj(_ r: Root, _ f: FormID, _ t: Tense, _ v: Voice, _ s: PronounSlot, _ m: Mood = .raf) -> String? {
    conjugator.conjugate(r, form: f, tense: t, voice: v, slot: s, mood: m)
}

let kataba = root("كتب")
let nasara = root("نصر")
let daraba = root("ضرب")
let jalasa = root("جلس")
let fataha = root("فتح")
let samia = root("سمع")
let karuma = root("كرم")
let hasiba = root("حسب")
let alima = root("علم")
let salima = root("سلم")
let qatala = root("قتل")
let kasara = root("كسر")
let ghafara = root("غفر")
let jamaa = root("جمع")
let zahara = root("ظهر")
let hamra = root("حمر")
let qala = root("قول")
let rama = root("رمي")

// MARK: - Form I māḍī maʿlūm across the six abwāb + suffix behaviors

run.expect(conj(kataba, .I, .madi, .malum, ._3ms), "كَتَبَ")
run.expect(conj(kataba, .I, .madi, .malum, ._3mp), "كَتَبُوا")
run.expect(conj(kataba, .I, .madi, .malum, ._3fs), "كَتَبَتْ")
run.expect(conj(kataba, .I, .madi, .malum, ._3fp), "كَتَبْنَ")
run.expect(conj(kataba, .I, .madi, .malum, ._2mp), "كَتَبْتُمْ")
run.expect(conj(kataba, .I, .madi, .malum, ._2fp), "كَتَبْتُنَّ")
run.expect(conj(kataba, .I, .madi, .malum, ._1p), "كَتَبْنَا")
run.expect(conj(samia, .I, .madi, .malum, ._3ms), "سَمِعَ")
run.expect(conj(karuma, .I, .madi, .malum, ._3ms), "كَرُمَ")
run.expect(conj(hasiba, .I, .madi, .malum, ._3ms), "حَسِبَ")

// MARK: - Form I muḍāriʿ across abwāb

run.expect(conj(kataba, .I, .mudari, .malum, ._3ms), "يَكْتُبُ")
run.expect(conj(daraba, .I, .mudari, .malum, ._3ms), "يَضْرِبُ")
run.expect(conj(fataha, .I, .mudari, .malum, ._3ms), "يَفْتَحُ")
run.expect(conj(samia, .I, .mudari, .malum, ._3ms), "يَسْمَعُ")
run.expect(conj(karuma, .I, .mudari, .malum, ._3ms), "يَكْرُمُ")
run.expect(conj(hasiba, .I, .mudari, .malum, ._3ms), "يَحْسِبُ")
run.expect(conj(kataba, .I, .mudari, .malum, ._3mp), "يَكْتُبُونَ")
run.expect(conj(kataba, .I, .mudari, .malum, ._2fs), "تَكْتُبِينَ")
run.expect(conj(kataba, .I, .mudari, .malum, ._3fp), "يَكْتُبْنَ")
run.expect(conj(kataba, .I, .mudari, .malum, ._3md), "يَكْتُبَانِ")
run.expect(conj(kataba, .I, .mudari, .malum, ._1s), "أَكْتُبُ")
run.expect(conj(kataba, .I, .mudari, .malum, ._1p), "نَكْتُبُ")

// MARK: - Form I majhūl

run.expect(conj(kataba, .I, .madi, .majhul, ._3ms), "كُتِبَ")
run.expect(conj(kataba, .I, .mudari, .majhul, ._3ms), "يُكْتَبُ")

// MARK: - Form I amr (ḍamma vs kasra hamza)

run.expect(conj(nasara, .I, .amr, .malum, ._2ms), "اُنْصُرْ")
run.expect(conj(daraba, .I, .amr, .malum, ._2ms), "اِضْرِبْ")
run.expect(conj(fataha, .I, .amr, .malum, ._2ms), "اِفْتَحْ")
run.expect(conj(kataba, .I, .amr, .malum, ._2mp), "اُكْتُبُوا")
run.expect(conj(kataba, .I, .amr, .malum, ._2fs), "اُكْتُبِي")

// MARK: - Mazīd forms — māḍī / muḍāriʿ / majhūl / amr

run.expect(conj(alima, .II, .madi, .malum, ._3ms), "عَلَّمَ")
run.expect(conj(alima, .II, .mudari, .malum, ._3ms), "يُعَلِّمُ")
run.expect(conj(alima, .II, .madi, .majhul, ._3ms), "عُلِّمَ")
run.expect(conj(alima, .II, .mudari, .majhul, ._3ms), "يُعَلَّمُ")
run.expect(conj(alima, .II, .madi, .malum, ._3fp), "عَلَّمْنَ")
run.expect(conj(alima, .II, .amr, .malum, ._2ms), "عَلِّمْ")
run.expect(conj(qatala, .III, .madi, .malum, ._3ms), "قَاتَلَ")
run.expect(conj(qatala, .III, .mudari, .malum, ._3ms), "يُقَاتِلُ")
run.expect(conj(qatala, .III, .madi, .majhul, ._3ms), "قُوتِلَ")
run.expect(conj(karuma, .IV, .madi, .malum, ._3ms), "أَكْرَمَ")
run.expect(conj(karuma, .IV, .mudari, .malum, ._3ms), "يُكْرِمُ")
run.expect(conj(karuma, .IV, .amr, .malum, ._2ms), "أَكْرِمْ")
run.expect(conj(alima, .V, .madi, .malum, ._3ms), "تَعَلَّمَ")
run.expect(conj(alima, .V, .mudari, .malum, ._3ms), "يَتَعَلَّمُ")
run.expect(conj(zahara, .VI, .madi, .malum, ._3ms), "تَظَاهَرَ")
run.expect(conj(zahara, .VI, .mudari, .malum, ._3ms), "يَتَظَاهَرُ")
run.expect(conj(kasara, .VII, .madi, .malum, ._3ms), "اِنْكَسَرَ")
run.expect(conj(kasara, .VII, .mudari, .malum, ._3ms), "يَنْكَسِرُ")
run.expect(conj(jamaa, .VIII, .madi, .malum, ._3ms), "اِجْتَمَعَ")
run.expect(conj(jamaa, .VIII, .mudari, .malum, ._3ms), "يَجْتَمِعُ")
run.expect(conj(ghafara, .X, .madi, .malum, ._3ms), "اِسْتَغْفَرَ")
run.expect(conj(ghafara, .X, .mudari, .malum, ._3ms), "يَسْتَغْفِرُ")
run.expect(conj(ghafara, .X, .amr, .malum, ._2ms), "اِسْتَغْفِرْ")
run.expect(conj(ghafara, .X, .madi, .majhul, ._3ms), "اُسْتُغْفِرَ")

// MARK: - Blocked combinations must be nil

run.expect(conj(kasara, .VII, .madi, .majhul, ._3ms), nil)   // lāzim form
run.expect(conj(jalasa, .I, .madi, .majhul, ._3ms), nil)     // intransitive root
run.expect(conj(hamra, .IX, .madi, .malum, ._3ms), nil)      // IX recognition-only

// MARK: - Derived nouns

run.expect(conjugator.derivedNoun(kataba, form: .I, kind: .ismFail), "كَاتِب")
run.expect(conjugator.derivedNoun(kataba, form: .I, kind: .ismMaful), "مَكْتُوب")
run.expect(conjugator.derivedNoun(kataba, form: .I, kind: .masdar), "كِتَابَة")
run.expect(conjugator.derivedNoun(alima, form: .II, kind: .ismFail), "مُعَلِّم")
run.expect(conjugator.derivedNoun(alima, form: .II, kind: .ismMaful), "مُعَلَّم")
run.expect(conjugator.derivedNoun(alima, form: .II, kind: .masdar), "تَعْلِيم")
run.expect(conjugator.derivedNoun(qatala, form: .III, kind: .masdar), "مُقَاتَلَة")
run.expect(conjugator.derivedNoun(karuma, form: .IV, kind: .masdar), "إِكْرَام")
run.expect(conjugator.derivedNoun(alima, form: .V, kind: .masdar), "تَعَلُّم")
run.expect(conjugator.derivedNoun(kasara, form: .VII, kind: .masdar), "اِنْكِسَار")
run.expect(conjugator.derivedNoun(jamaa, form: .VIII, kind: .masdar), "اِجْتِمَاع")
run.expect(conjugator.derivedNoun(hamra, form: .IX, kind: .masdar), "اِحْمِرَار")
run.expect(conjugator.derivedNoun(ghafara, form: .X, kind: .masdar), "اِسْتِغْفَار")
run.expect(conjugator.derivedNoun(ghafara, form: .X, kind: .ismFail), "مُسْتَغْفِر")

// MARK: - Wazn rendering on ف-ع-ل

run.expect(conjugator.wazn(of: .II, tense: .madi, voice: .malum, slot: ._3ms), "فَعَّلَ")
run.expect(conjugator.wazn(of: .X, tense: .mudari, voice: .malum, slot: ._3ms), "يَسْتَفْعِلُ")
run.expect(conjugator.wazn(of: .I, tense: .madi, voice: .majhul, slot: ._3ms), "فُعِلَ")

// MARK: - Hand-authored override: قول (ajwaf)

run.expect(conj(qala, .I, .madi, .malum, ._3ms), "قَالَ")
run.expect(conj(qala, .I, .madi, .malum, ._3fp), "قُلْنَ")
run.expect(conj(qala, .I, .mudari, .malum, ._2fs), "تَقُولِينَ")
run.expect(conj(qala, .I, .amr, .malum, ._2ms), "قُلْ")
run.expect(conj(qala, .I, .madi, .majhul, ._3ms), "قِيلَ")
run.expect(conj(qala, .I, .mudari, .majhul, ._3ms), "يُقَالُ")

// MARK: - Hand-authored override: رمي (nāqiṣ)

run.expect(conj(rama, .I, .madi, .malum, ._3ms), "رَمَى")
run.expect(conj(rama, .I, .madi, .malum, ._3mp), "رَمَوْا")
run.expect(conj(rama, .I, .mudari, .malum, ._3ms), "يَرْمِي")
run.expect(conj(rama, .I, .madi, .majhul, ._3ms), "رُمِيَ")
run.expect(conj(rama, .I, .mudari, .majhul, ._3ms), "يُرْمَى")
run.expect(conj(rama, .I, .amr, .malum, ._2ms), "اِرْمِ")

// MARK: - Manṣūb / majzūm (engine-generated for sālim)

run.expect(conj(kataba, .I, .mudari, .malum, ._3ms, .nasb), "يَكْتُبَ")
run.expect(conj(kataba, .I, .mudari, .malum, ._3ms, .jazm), "يَكْتُبْ")
run.expect(conj(kataba, .I, .mudari, .malum, ._3mp, .nasb), "يَكْتُبُوا")
run.expect(conj(kataba, .I, .mudari, .malum, ._3mp, .jazm), "يَكْتُبُوا")
run.expect(conj(kataba, .I, .mudari, .malum, ._2fs, .jazm), "تَكْتُبِي")
run.expect(conj(kataba, .I, .mudari, .malum, ._3fp, .jazm), "يَكْتُبْنَ")
run.expect(conj(kataba, .I, .mudari, .malum, ._3md, .nasb), "يَكْتُبَا")
run.expect(conj(alima, .II, .mudari, .malum, ._3ms, .jazm), "يُعَلِّمْ")
run.expect(conj(kataba, .I, .mudari, .majhul, ._3ms, .jazm), "يُكْتَبْ")
run.expect(conj(ghafara, .X, .mudari, .malum, ._1p, .nasb), "نَسْتَغْفِرَ")

// MARK: - Manṣūb / majzūm (hand-authored iʿlāl for irregulars)

run.expect(conj(qala, .I, .mudari, .malum, ._3ms, .nasb), "يَقُولَ")
run.expect(conj(qala, .I, .mudari, .malum, ._3ms, .jazm), "يَقُلْ")
run.expect(conj(rama, .I, .mudari, .malum, ._3ms, .nasb), "يَرْمِيَ")
run.expect(conj(rama, .I, .mudari, .malum, ._3ms, .jazm), "يَرْمِ")
run.expect(conj(qala, .I, .mudari, .majhul, ._3ms, .jazm), nil)  // no table yet

// MARK: - English meaning rendering

run.expect(meanings.verbMeaning(kataba, form: .I, tense: .madi, voice: .malum, slot: ._3ms), "he wrote")
run.expect(meanings.verbMeaning(kataba, form: .I, tense: .madi, voice: .majhul, slot: ._3fs), "she was written")
run.expect(meanings.verbMeaning(alima, form: .II, tense: .mudari, voice: .malum, slot: ._3fs), "she teaches / will teach")
run.expect(meanings.verbMeaning(alima, form: .II, tense: .mudari, voice: .malum, slot: ._3mp), "they (m, 3+) teach / will teach")
run.expect(meanings.verbMeaning(alima, form: .II, tense: .madi, voice: .majhul, slot: ._1s), "I was taught")
run.expect(meanings.verbMeaning(kataba, form: .I, tense: .amr, voice: .malum, slot: ._2fs), "write! (you (f))")
run.expect(meanings.verbMeaning(salima, form: .I, tense: .madi, voice: .malum, slot: ._3mp), "they (m, 3+) were safe")
run.expect(meanings.verbMeaning(salima, form: .I, tense: .mudari, voice: .malum, slot: ._3ms), "he is safe / will be safe")
run.expect(meanings.verbMeaning(qala, form: .I, tense: .madi, voice: .majhul, slot: ._3ms), "he was said")
run.expect(meanings.derivedNounMeaning(alima, form: .II, kind: .ismFail), "one who teaches")
run.expect(meanings.derivedNounMeaning(kataba, form: .I, kind: .ismMaful), "that which is written")
run.expect(meanings.derivedNounMeaning(kataba, form: .I, kind: .masdar), "writing (the act itself)")

// MARK: - Drill quizzes: 5 words × 3 questions, second slot is voice or wazn

func checkDrillBundle(_ label: String, _ quiz: [Question], expectedForms: [FormID]) {
    var ok = quiz.count == 15
        && quiz.allSatisfy { !$0.gloss.isEmpty && !$0.fullMeaning.isEmpty && $0.bundleTag != nil }
        && quiz.allSatisfy { expectedForms.contains($0.formID) }
    if ok {
        for wordStart in stride(from: 0, to: 15, by: 3) {
            ok = ok
                && quiz[wordStart].category == .tense
                && [.voice, .wazn].contains(quiz[wordStart + 1].category)
                && quiz[wordStart + 2].category == .doer
        }
    }
    run.expectTrue(ok, "\(label) → \(quiz.count) questions [\(quiz.map(\.category.rawValue).joined(separator: ","))] forms [\(quiz.map(\.formID.rawValue).joined(separator: ","))]")
}

for preset in DrillPreset.formOneDrills where ["salim", "ajwaf", "naqis", "mixed"].contains(preset.id) {
    checkDrillBundle("preset \(preset.id)", generator.simpleQuiz(preset: preset), expectedForms: [.I])
}
for form in FormID.mazeedForms where generator.isDrillAvailable(generator.mazeedDrill(for: form)) {
    checkDrillBundle("mazeed \(form.rawValue)", generator.simpleQuiz(preset: generator.mazeedDrill(for: form)), expectedForms: [form])
}
run.expectTrue(!generator.isDrillAvailable(generator.mazeedDrill(for: .IX)), "Form IX drill should be unavailable")

// MARK: - Done

run.finish()
