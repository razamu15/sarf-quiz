// Ajwaf — the ʿAYN is weak (قَالَ, سَارَ). Engine-conjugated by
// AjwafConjugator, which reads the weak letter off the root rather than off the
// type name, so one engine serves both variants.
//
// TWO TYPES LIVE HERE, ajwaf_waw and ajwaf_ya, split by which letter is weak
// because that is what decides the iʿlāl. The student sees one chip, أَجْوَف.
//
// Record shape, engine routing and the trans/bab/masdar conventions are
// documented once in the barrel, ../roots.js — read that first.

export const AJWAF_ROOTS = [
  // --- Ajwaf wāw · و as middle radical ---------------------------------------
  {
    root: ['ق', 'و', 'ل'], type: 'ajwaf_waw',
    forms: {
      I: {
        bab: 'au', gloss: 'to say', masdar: 'قَوْل', trans: true,
        en: { past: 'said', pp: 'said', pres3: 'says', ing: 'saying' },
        manualTables: {
          madi_malum: {
            '3ms': 'قَالَ', '3md': 'قَالَا', '3mp': 'قَالُوا',
            '3fs': 'قَالَتْ', '3fd': 'قَالَتَا', '3fp': 'قُلْنَ',
            '2ms': 'قُلْتَ', '2md': 'قُلْتُمَا', '2mp': 'قُلْتُمْ',
            '2fs': 'قُلْتِ', '2fd': 'قُلْتُمَا', '2fp': 'قُلْتُنَّ',
            '1s': 'قُلْتُ', '1p': 'قُلْنَا',
          },
          madi_majhul: {
            '3ms': 'قِيلَ', '3md': 'قِيلَا', '3mp': 'قِيلُوا',
            '3fs': 'قِيلَتْ', '3fd': 'قِيلَتَا', '3fp': 'قِلْنَ',
            '2ms': 'قِلْتَ', '2md': 'قِلْتُمَا', '2mp': 'قِلْتُمْ',
            '2fs': 'قِلْتِ', '2fd': 'قِلْتُمَا', '2fp': 'قِلْتُنَّ',
            '1s': 'قِلْتُ', '1p': 'قِلْنَا',
          },
          mudari_malum_raf: {
            '3ms': 'يَقُولُ', '3md': 'يَقُولَانِ', '3mp': 'يَقُولُونَ',
            '3fs': 'تَقُولُ', '3fd': 'تَقُولَانِ', '3fp': 'يَقُلْنَ',
            '2ms': 'تَقُولُ', '2md': 'تَقُولَانِ', '2mp': 'تَقُولُونَ',
            '2fs': 'تَقُولِينَ', '2fd': 'تَقُولَانِ', '2fp': 'تَقُلْنَ',
            '1s': 'أَقُولُ', '1p': 'نَقُولُ',
          },
          mudari_majhul_raf: {
            '3ms': 'يُقَالُ', '3md': 'يُقَالَانِ', '3mp': 'يُقَالُونَ',
            '3fs': 'تُقَالُ', '3fd': 'تُقَالَانِ', '3fp': 'يُقَلْنَ',
            '2ms': 'تُقَالُ', '2md': 'تُقَالَانِ', '2mp': 'تُقَالُونَ',
            '2fs': 'تُقَالِينَ', '2fd': 'تُقَالَانِ', '2fp': 'تُقَلْنَ',
            '1s': 'أُقَالُ', '1p': 'نُقَالُ',
          },
          mudari_malum_nasb: {
            '3ms': 'يَقُولَ', '3md': 'يَقُولَا', '3mp': 'يَقُولُوا',
            '3fs': 'تَقُولَ', '3fd': 'تَقُولَا', '3fp': 'يَقُلْنَ',
            '2ms': 'تَقُولَ', '2md': 'تَقُولَا', '2mp': 'تَقُولُوا',
            '2fs': 'تَقُولِي', '2fd': 'تَقُولَا', '2fp': 'تَقُلْنَ',
            '1s': 'أَقُولَ', '1p': 'نَقُولَ',
          },
          mudari_malum_jazm: {
            '3ms': 'يَقُلْ', '3md': 'يَقُولَا', '3mp': 'يَقُولُوا',
            '3fs': 'تَقُلْ', '3fd': 'تَقُولَا', '3fp': 'يَقُلْنَ',
            '2ms': 'تَقُلْ', '2md': 'تَقُولَا', '2mp': 'تَقُولُوا',
            '2fs': 'تَقُولِي', '2fd': 'تَقُولَا', '2fp': 'تَقُلْنَ',
            '1s': 'أَقُلْ', '1p': 'نَقُلْ',
          },
          amr_malum: {
            '2ms': 'قُلْ', '2md': 'قُولَا', '2mp': 'قُولُوا',
            '2fs': 'قُولِي', '2fd': 'قُولَا', '2fp': 'قُلْنَ',
          },
        },
        reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%A7%D9%84%D9%8E.html',
      },
      // The mazīd forms carry no fixtures and never did: manualTables were only
      // ever a stand-in for a missing ENGINE, and the ajwaf engine has been
      // authoring III–X for as long as it has existed. These go through it.
      III: { gloss: 'to negotiate with', trans: true,
             en: { past: 'negotiated with', pp: 'negotiated with', pres3: 'negotiates with', ing: 'negotiating with' } },
      IV: { gloss: 'to release from a contract', trans: true,
            en: { past: 'released', pp: 'released', pres3: 'releases', ing: 'releasing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%82%D9%8E%D8%A7%D9%84%D9%8E.html' },
      V: { gloss: 'to fabricate a saying against', trans: true,
           en: { past: 'fabricated against', pp: 'fabricated against', pres3: 'fabricates against', ing: 'fabricating against' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%82%D9%8E%D9%88%D9%91%D9%8E%D9%84%D9%8E.html' },
      VI: { gloss: 'to converse with one another', trans: false,
            en: { past: 'conversed with one another', pres3: 'converse with one another', ing: 'conversing with one another' } },
      X: { gloss: 'to resign', trans: false,
           en: { past: 'resigned', pres3: 'resigns', ing: 'resigning' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%82%D9%8E%D8%A7%D9%84%D9%8E.html' },
    },
  },
  {
    root: ['ن', 'و', 'م'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to sleep', masdar: 'نَوْم', trans: false,
           en: { past: 'slept', pres3: 'sleeps', ing: 'sleeping' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D9%8E%D8%A7%D9%85%D9%8E.html' },
      II: { gloss: 'to put to sleep', trans: true,
            en: { past: 'put to sleep', pp: 'put to sleep', pres3: 'puts to sleep', ing: 'putting to sleep' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D9%8E%D9%88%D9%91%D9%8E%D9%85%D9%8E.html' },
      IV: { gloss: 'to lay down / put to sleep', trans: true,
            en: { past: 'laid down', pp: 'laid down', pres3: 'lays down', ing: 'laying down' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%86%D9%8E%D8%A7%D9%85%D9%8E.html' },
      X: { gloss: 'to feel at ease', trans: false,
           en: { past: 'felt at ease', pres3: 'feels at ease', ing: 'feeling at ease' } },
    },
  },
  {
    root: ['خ', 'و', 'ف'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to fear', masdar: 'خَوْف', trans: true,
           en: { past: 'feared', pp: 'feared', pres3: 'fears', ing: 'fearing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AE%D9%8E%D8%A7%D9%81%D9%8E.html' },
      II: { gloss: 'to frighten / intimidate', trans: true,
            en: { past: 'frightened', pp: 'frightened', pres3: 'frightens', ing: 'frightening' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AE%D9%8E%D9%88%D9%91%D9%8E%D9%81%D9%8E.html' },
      IV: { gloss: 'to scare', trans: true,
            en: { past: 'scared', pp: 'scared', pres3: 'scares', ing: 'scaring' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D8%AE%D9%8E%D8%A7%D9%81%D9%8E.html' },
      V: { gloss: 'to be apprehensive', trans: false,
           en: { past: 'was apprehensive', pres3: 'is apprehensive', ing: 'being apprehensive' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%AE%D9%8E%D9%88%D9%91%D9%8E%D9%81%D9%8E.html' },
    },
  },
  {
    root: ['م', 'و', 'ت'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'au', gloss: 'to die', masdar: 'مَوْت', trans: false,
           en: { past: 'died', pres3: 'dies', ing: 'dying' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%85%D9%8E%D8%A7%D8%AA%D9%8E.html' },
      IV: { gloss: 'to cause to die', trans: true,
            en: { past: 'put to death', pp: 'put to death', pres3: 'puts to death', ing: 'putting to death' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%85%D9%8E%D8%A7%D8%AA%D9%8E.html' },
      V: { gloss: 'to feign death', trans: false,
           en: { past: 'feigned death', pres3: 'feigns death', ing: 'feigning death' } },
      X: { gloss: 'to fight to the death', trans: false,
           en: { past: 'fought to the death', pres3: 'fights to the death', ing: 'fighting to the death' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%85%D9%8E%D8%A7%D8%AA%D9%8E.html' },
    },
  },
  {
    root: ['ز', 'و', 'ر'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'au', gloss: 'to visit', masdar: 'زِيَارَة', trans: true,
           en: { past: 'visited', pp: 'visited', pres3: 'visits', ing: 'visiting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B2%D9%8E%D8%A7%D8%B1%D9%8E.html' },
      II: { gloss: 'to forge / falsify', trans: true,
            en: { past: 'forged', pp: 'forged', pres3: 'forges', ing: 'forging' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B2%D9%8E%D9%88%D9%91%D9%8E%D8%B1%D9%8E.html' },
      VI: { gloss: 'to visit one another', trans: false,
            en: { past: 'visited one another', pres3: 'visit one another', ing: 'visiting one another' } },
    },
  },
  {
    root: ['ص', 'و', 'م'], type: 'ajwaf_waw',
    forms: {
      // Form I only, and that is a finding rather than a gap: صَوَّمَ and أَصَامَ
      // are both in the dictionaries but neither is in live use, and a mazīd
      // form nobody says is a distractor a quiz would offer as a real word.
      // صِيَام is the commoner NOUN; صَوْم is the maṣdar proper.
      I: { bab: 'au', gloss: 'to fast', masdar: 'صَوْم', trans: false,
           en: { past: 'fasted', pres3: 'fasts', ing: 'fasting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B5%D9%8E%D8%A7%D9%85%D9%8E.html' },
    },
  },
  {
    root: ['ق', 'و', 'م'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'au', gloss: 'to stand / rise', masdar: 'قِيَام', trans: false,
           en: { past: 'stood', pres3: 'stands', ing: 'standing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%A7%D9%85%D9%8E.html' },
      II: { gloss: 'to straighten / evaluate', trans: true,
            en: { past: 'evaluated', pp: 'evaluated', pres3: 'evaluates', ing: 'evaluating' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D9%88%D9%91%D9%8E%D9%85%D9%8E.html' },
      III: { gloss: 'to resist / withstand', trans: true,
             en: { past: 'resisted', pp: 'resisted', pres3: 'resists', ing: 'resisting' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%A7%D9%88%D9%8E%D9%85%D9%8E.html' },
      IV: { gloss: 'to establish / perform', trans: true,
            en: { past: 'established', pp: 'established', pres3: 'establishes', ing: 'establishing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%82%D9%8E%D8%A7%D9%85%D9%8E.html' },
      X: { gloss: 'to be upright / straight', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%82%D9%8E%D8%A7%D9%85%D9%8E.html' },
    },
  },
  // --- Ajwaf yāʾ · ي as middle radical ---------------------------------------
  {
    root: ['س', 'ي', 'ر'], type: 'ajwaf_ya',
    forms: {
      I: { bab: 'ai', gloss: 'to travel / journey', masdar: 'سَيْر', trans: false,
           en: { past: 'travelled', pres3: 'travels', ing: 'travelling' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%8E%D8%A7%D8%B1%D9%8E.html' },
      II: { gloss: 'to set in motion', trans: true,
            en: { past: 'set in motion', pp: 'set in motion', pres3: 'sets in motion', ing: 'setting in motion' } },
      III: { gloss: 'to keep pace with', trans: true,
             en: { past: 'kept pace with', pp: 'kept pace with', pres3: 'keeps pace with', ing: 'keeping pace with' } },
    },
  },
  {
    root: ['ب', 'ي', 'ع'], type: 'ajwaf_ya',
    forms: {
      I: { bab: 'ai', gloss: 'to sell', masdar: 'بَيْع', trans: true,
           en: { past: 'sold', pp: 'sold', pres3: 'sells', ing: 'selling' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A8%D9%8E%D8%A7%D8%B9%D9%8E.html' },
      III: { gloss: 'to pledge allegiance to', trans: true,
             en: { past: 'pledged allegiance to', pp: 'pledged allegiance to', pres3: 'pledges allegiance to', ing: 'pledging allegiance to' } },
      VI: { gloss: 'to trade with each other', trans: false,
            en: { past: 'traded with each other', pres3: 'trade with each other', ing: 'trading with each other' } },
      VIII: { gloss: 'to buy / purchase', trans: true,
              en: { past: 'bought', pp: 'bought', pres3: 'buys', ing: 'buying' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%A8%D9%92%D8%AA%D9%8E%D8%A7%D8%B9%D9%8E.html' },
    },
  },
  {
    root: ['ن', 'ي', 'ل'], type: 'ajwaf_ya',
    forms: {
      I: { bab: 'aa', gloss: 'to obtain / attain', masdar: 'نَيْل', trans: true,
           en: { past: 'obtained', pp: 'obtained', pres3: 'obtains', ing: 'obtaining' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D9%8E%D8%A7%D9%84%D9%8E.html' },
      IV: { gloss: 'to grant', trans: true,
            en: { past: 'granted', pp: 'granted', pres3: 'grants', ing: 'granting' } },
    },
  },
  {
    root: ['ه', 'ي', 'ب'], type: 'ajwaf_ya',
    forms: {
      I: { bab: 'aa', gloss: 'to hold in awe', masdar: 'هَيْبَة', trans: true,
           en: { past: 'held in awe', pp: 'held in awe', pres3: 'holds in awe', ing: 'holding in awe' } },
      V: { gloss: 'to dread', trans: true,
           en: { past: 'dreaded', pp: 'dreaded', pres3: 'dreads', ing: 'dreading' } },
    },
  },
  {
    root: ['ب', 'ي', 'ت'], type: 'ajwaf_ya',
    forms: {
      // The lām is تاء, which is what the 1s and 2nd-person endings open with —
      // so the mutaḥarrik slots merge across the join (بِتُّ, not بِتْتُ), the
      // one place joinEnding()'s idghām fires for a non-muḍāʿaf root.
      I: { bab: 'ai', gloss: 'to spend the night', masdar: 'بَيْتُوتَة', trans: false,
           en: { past: 'spent the night', pres3: 'spends the night', ing: 'spending the night' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A8%D9%8E%D8%A7%D8%AA%D9%8E.html' },
      II: { gloss: 'to plot by night', trans: true,
            en: { past: 'plotted by night', pp: 'plotted by night', pres3: 'plots by night', ing: 'plotting by night' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A8%D9%8E%D9%8A%D9%91%D9%8E%D8%AA%D9%8E.html' },
      IV: { gloss: 'to lodge for the night', trans: true,
            en: { past: 'lodged', pp: 'lodged', pres3: 'lodges', ing: 'lodging' } },
    },
  },
];
