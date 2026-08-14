// Root lexicon — the only data file in the v2 model (everything else is
// grammar-as-code). Sālim roots are engine-conjugated; verb types without an
// engine yet (قول, رمي at the bottom) carry hand-authored MANUAL TABLES,
// keyed by ChartID, which ConjugationService serves as a fallback and the
// test suite uses as the parity bar for future per-type engines.
//
// forms.*.manualTables → { ChartID: { PronounSlot: word } }, hand-authored.
//                 Temporary by design: when the verb type's engine lands, these
//                 become its parity fixtures and the fallback path is deleted.
//
// forms.I.bab   → which of the six abwāb (1..6)
// forms.*.trans → transitive? (majhūl questions only make sense when true)
// forms.*.en    → English conjugation bits for meaning display:
//                 { past: 'wrote', pp: 'written', pres3: 'writes', ing: 'writing' }
//                 Glosses starting with "to be …" are auto-conjugated (was/is/are)
//                 and need no en block.
// forms.I.masdar is samāʿī (per-root); mazīd maṣādir come from templates.

export const ROOTS = [
  {
    root: ['ك', 'ت', 'ب'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to write', masdar: 'كِتَابَة', trans: true,
           en: { past: 'wrote', pp: 'written', pres3: 'writes', ing: 'writing' } },
    },
  },
  {
    root: ['ن', 'ص', 'ر'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to help', masdar: 'نَصْر', trans: true,
           en: { past: 'helped', pp: 'helped', pres3: 'helps', ing: 'helping' } },
    },
  },
  {
    root: ['خ', 'ر', 'ج'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to go out', masdar: 'خُرُوج', trans: false,
           en: { past: 'went out', pres3: 'goes out', ing: 'going out' } },
      IV: { gloss: 'to expel / bring out', trans: true,
            en: { past: 'expelled', pp: 'expelled', pres3: 'expels', ing: 'expelling' } },
      X: { gloss: 'to extract', trans: true,
           en: { past: 'extracted', pp: 'extracted', pres3: 'extracts', ing: 'extracting' } },
    },
  },
  {
    root: ['ن', 'ظ', 'ر'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to look', masdar: 'نَظَر', trans: true,
           en: { past: 'looked', pp: 'looked at', pres3: 'looks', ing: 'looking' } },
      VIII: { gloss: 'to wait for', trans: true,
              en: { past: 'waited for', pp: 'waited for', pres3: 'waits for', ing: 'waiting for' } },
    },
  },
  {
    root: ['ق', 'ت', 'ل'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to kill', masdar: 'قَتْل', trans: true,
           en: { past: 'killed', pp: 'killed', pres3: 'kills', ing: 'killing' } },
      III: { gloss: 'to fight', trans: true,
             en: { past: 'fought', pp: 'fought', pres3: 'fights', ing: 'fighting' } },
    },
  },
  {
    root: ['ض', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to hit', masdar: 'ضَرْب', trans: true,
           en: { past: 'hit', pp: 'hit', pres3: 'hits', ing: 'hitting' } },
    },
  },
  {
    root: ['ج', 'ل', 'س'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to sit', masdar: 'جُلُوس', trans: false,
           en: { past: 'sat', pres3: 'sits', ing: 'sitting' } },
    },
  },
  {
    root: ['ك', 'س', 'ر'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to break', masdar: 'كَسْر', trans: true,
           en: { past: 'broke', pp: 'broken', pres3: 'breaks', ing: 'breaking' } },
      II: { gloss: 'to smash to pieces', trans: true,
            en: { past: 'smashed', pp: 'smashed', pres3: 'smashes', ing: 'smashing' } },
      VII: { gloss: 'to get broken', trans: false,
             en: { past: 'got broken', pres3: 'gets broken', ing: 'getting broken' } },
    },
  },
  {
    root: ['غ', 'ف', 'ر'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to forgive', masdar: 'مَغْفِرَة', trans: true,
           en: { past: 'forgave', pp: 'forgiven', pres3: 'forgives', ing: 'forgiving' } },
      X: { gloss: 'to seek forgiveness', trans: true,
           en: { past: 'sought forgiveness', pp: 'asked for forgiveness', pres3: 'seeks forgiveness', ing: 'seeking forgiveness' } },
    },
  },
  {
    root: ['ف', 'ت', 'ح'], type: 'salim',
    forms: {
      I: { bab: 3, gloss: 'to open', masdar: 'فَتْح', trans: true,
           en: { past: 'opened', pp: 'opened', pres3: 'opens', ing: 'opening' } },
    },
  },
  {
    root: ['ج', 'م', 'ع'], type: 'salim',
    forms: {
      I: { bab: 3, gloss: 'to gather', masdar: 'جَمْع', trans: true,
           en: { past: 'gathered', pp: 'gathered', pres3: 'gathers', ing: 'gathering' } },
      VIII: { gloss: 'to assemble / meet', trans: false,
              en: { past: 'assembled', pres3: 'assembles', ing: 'assembling' } },
    },
  },
  {
    root: ['ظ', 'ه', 'ر'], type: 'salim',
    forms: {
      I: { bab: 3, gloss: 'to appear', masdar: 'ظُهُور', trans: false,
           en: { past: 'appeared', pres3: 'appears', ing: 'appearing' } },
      IV: { gloss: 'to reveal', trans: true,
            en: { past: 'revealed', pp: 'revealed', pres3: 'reveals', ing: 'revealing' } },
      VI: { gloss: 'to pretend / demonstrate', trans: false,
            en: { past: 'pretended', pres3: 'pretends', ing: 'pretending' } },
    },
  },
  {
    root: ['س', 'م', 'ع'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to hear', masdar: 'سَمْع', trans: true,
           en: { past: 'heard', pp: 'heard', pres3: 'hears', ing: 'hearing' } },
      VIII: { gloss: 'to listen', trans: false,
              en: { past: 'listened', pres3: 'listens', ing: 'listening' } },
    },
  },
  {
    root: ['ش', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to drink', masdar: 'شُرْب', trans: true,
           en: { past: 'drank', pp: 'drunk', pres3: 'drinks', ing: 'drinking' } },
    },
  },
  {
    root: ['ع', 'ل', 'م'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to know', masdar: 'عِلْم', trans: true,
           en: { past: 'knew', pp: 'known', pres3: 'knows', ing: 'knowing' } },
      II: { gloss: 'to teach', trans: true,
            en: { past: 'taught', pp: 'taught', pres3: 'teaches', ing: 'teaching' } },
      V: { gloss: 'to learn', trans: false,
           en: { past: 'learned', pres3: 'learns', ing: 'learning' } },
      X: { gloss: 'to inquire', trans: true,
           en: { past: 'inquired', pp: 'inquired about', pres3: 'inquires', ing: 'inquiring' } },
    },
  },
  {
    root: ['س', 'ل', 'م'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to be safe', masdar: 'سَلَامَة', trans: false },
      II: { gloss: 'to greet / hand over', trans: true,
            en: { past: 'greeted', pp: 'greeted', pres3: 'greets', ing: 'greeting' } },
      IV: { gloss: 'to submit (Islam)', trans: false,
            en: { past: 'submitted', pres3: 'submits', ing: 'submitting' } },
      X: { gloss: 'to surrender', trans: false,
           en: { past: 'surrendered', pres3: 'surrenders', ing: 'surrendering' } },
    },
  },
  {
    root: ['ك', 'ر', 'م'], type: 'salim',
    forms: {
      I: { bab: 5, gloss: 'to be noble', masdar: 'كَرَم', trans: false },
      IV: { gloss: 'to honor', trans: true,
            en: { past: 'honored', pp: 'honored', pres3: 'honors', ing: 'honoring' } },
    },
  },
  {
    root: ['ق', 'د', 'م'], type: 'salim',
    forms: {
      I: { bab: 5, gloss: 'to be old / ancient', masdar: 'قِدَم', trans: false },
      II: { gloss: 'to present / offer', trans: true,
            en: { past: 'presented', pp: 'presented', pres3: 'presents', ing: 'presenting' } },
      V: { gloss: 'to advance', trans: false,
           en: { past: 'advanced', pres3: 'advances', ing: 'advancing' } },
    },
  },
  {
    root: ['ح', 'س', 'ب'], type: 'salim',
    forms: {
      I: { bab: 6, gloss: 'to deem / suppose', masdar: 'حُسْبَان', trans: true,
           en: { past: 'deemed', pp: 'deemed', pres3: 'deems', ing: 'deeming' } },
    },
  },
  {
    root: ['ش', 'ر', 'ك'], type: 'salim',
    forms: {
      III: { gloss: 'to partner with', trans: true,
             en: { past: 'partnered with', pp: 'partnered with', pres3: 'partners with', ing: 'partnering with' } },
      VIII: { gloss: 'to participate', trans: false,
              en: { past: 'participated', pres3: 'participates', ing: 'participating' } },
    },
  },
  {
    root: ['ح', 'م', 'ر'], type: 'salim',
    forms: {
      IX: { gloss: 'to turn red', trans: false,
            en: { past: 'turned red', pres3: 'turns red', ing: 'turning red' } },
    },
  },
  {
    root: ['ص', 'ف', 'ر'], type: 'salim',
    forms: {
      IX: { gloss: 'to turn yellow', trans: false,
            en: { past: 'turned yellow', pres3: 'turns yellow', ing: 'turning yellow' } },
    },
  },

  // -------------------------------------------------------------------------
  // Muḍāʿaf — engine-conjugated (MudaafConjugator). No fixture tables: the
  // hand-checked charts for these roots live in the parity suite, which is
  // where they do their job now.
  // -------------------------------------------------------------------------
  {
    root: ['م', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 1, gloss: 'to stretch out / extend', masdar: 'مَدّ', trans: true,
           en: { past: 'stretched out', pp: 'stretched out', pres3: 'stretches out', ing: 'stretching out' } },
      VIII: { gloss: 'to extend / stretch', trans: false,
              en: { past: 'extended', pres3: 'extends', ing: 'extending' } },
      X: { gloss: 'to seek help / draw from', trans: true,
           en: { past: 'drew on', pp: 'drawn on', pres3: 'draws on', ing: 'drawing on' } },
    },
  },
  {
    root: ['ر', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 1, gloss: 'to return / send back', masdar: 'رَدّ', trans: true,
           en: { past: 'returned', pp: 'returned', pres3: 'returns', ing: 'returning' } },
      VIII: { gloss: 'to turn back', trans: false,
              en: { past: 'turned back', pres3: 'turns back', ing: 'turning back' } },
    },
  },
  {
    root: ['ح', 'ب', 'ب'], type: 'mudaaf',
    forms: {
      IV: { gloss: 'to love', trans: true,
            en: { past: 'loved', pp: 'loved', pres3: 'loves', ing: 'loving' } },
    },
  },
  {
    root: ['ظ', 'ل', 'ل'], type: 'mudaaf',
    forms: {
      // bāb 4 (samiʿa) — the muḍāriʿ keeps the ʿayn's fatḥa: يَظَلُّ، and the
      // unfolded past shows the kasra the merge hid: ظَلِلْتُ
      I: { bab: 4, gloss: 'to remain / keep doing', masdar: 'ظُلُول', trans: false,
           en: { past: 'remained', pres3: 'remains', ing: 'remaining' } },
    },
  },

  // -------------------------------------------------------------------------
  // Hand-authored irregulars. manualTables override the engine; slots they
  // don't cover simply aren't quizzed.
  // -------------------------------------------------------------------------
  {
    root: ['ق', 'و', 'ل'], type: 'ajwaf',
    forms: {
      I: {
        bab: 1, gloss: 'to say', masdar: 'قَوْل', trans: true,
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
      },
    },
  },
  {
    root: ['ر', 'م', 'ي'], type: 'naqis',
    forms: {
      I: {
        bab: 2, gloss: 'to throw', masdar: 'رَمْي', trans: true,
        en: { past: 'threw', pp: 'thrown', pres3: 'throws', ing: 'throwing' },
        manualTables: {
          madi_malum: {
            '3ms': 'رَمَى', '3md': 'رَمَيَا', '3mp': 'رَمَوْا',
            '3fs': 'رَمَتْ', '3fd': 'رَمَتَا', '3fp': 'رَمَيْنَ',
            '2ms': 'رَمَيْتَ', '2md': 'رَمَيْتُمَا', '2mp': 'رَمَيْتُمْ',
            '2fs': 'رَمَيْتِ', '2fd': 'رَمَيْتُمَا', '2fp': 'رَمَيْتُنَّ',
            '1s': 'رَمَيْتُ', '1p': 'رَمَيْنَا',
          },
          madi_majhul: {
            '3ms': 'رُمِيَ', '3md': 'رُمِيَا', '3mp': 'رُمُوا',
            '3fs': 'رُمِيَتْ', '3fd': 'رُمِيَتَا', '3fp': 'رُمِينَ',
            '2ms': 'رُمِيتَ', '2md': 'رُمِيتُمَا', '2mp': 'رُمِيتُمْ',
            '2fs': 'رُمِيتِ', '2fd': 'رُمِيتُمَا', '2fp': 'رُمِيتُنَّ',
            '1s': 'رُمِيتُ', '1p': 'رُمِينَا',
          },
          mudari_malum_raf: {
            '3ms': 'يَرْمِي', '3md': 'يَرْمِيَانِ', '3mp': 'يَرْمُونَ',
            '3fs': 'تَرْمِي', '3fd': 'تَرْمِيَانِ', '3fp': 'يَرْمِينَ',
            '2ms': 'تَرْمِي', '2md': 'تَرْمِيَانِ', '2mp': 'تَرْمُونَ',
            '2fs': 'تَرْمِينَ', '2fd': 'تَرْمِيَانِ', '2fp': 'تَرْمِينَ',
            '1s': 'أَرْمِي', '1p': 'نَرْمِي',
          },
          mudari_majhul_raf: {
            '3ms': 'يُرْمَى', '3md': 'يُرْمَيَانِ', '3mp': 'يُرْمَوْنَ',
            '3fs': 'تُرْمَى', '3fd': 'تُرْمَيَانِ', '3fp': 'يُرْمَيْنَ',
            '2ms': 'تُرْمَى', '2md': 'تُرْمَيَانِ', '2mp': 'تُرْمَوْنَ',
            '2fs': 'تُرْمَيْنَ', '2fd': 'تُرْمَيَانِ', '2fp': 'تُرْمَيْنَ',
            '1s': 'أُرْمَى', '1p': 'نُرْمَى',
          },
          mudari_malum_nasb: {
            '3ms': 'يَرْمِيَ', '3md': 'يَرْمِيَا', '3mp': 'يَرْمُوا',
            '3fs': 'تَرْمِيَ', '3fd': 'تَرْمِيَا', '3fp': 'يَرْمِينَ',
            '2ms': 'تَرْمِيَ', '2md': 'تَرْمِيَا', '2mp': 'تَرْمُوا',
            '2fs': 'تَرْمِي', '2fd': 'تَرْمِيَا', '2fp': 'تَرْمِينَ',
            '1s': 'أَرْمِيَ', '1p': 'نَرْمِيَ',
          },
          mudari_malum_jazm: {
            '3ms': 'يَرْمِ', '3md': 'يَرْمِيَا', '3mp': 'يَرْمُوا',
            '3fs': 'تَرْمِ', '3fd': 'تَرْمِيَا', '3fp': 'يَرْمِينَ',
            '2ms': 'تَرْمِ', '2md': 'تَرْمِيَا', '2mp': 'تَرْمُوا',
            '2fs': 'تَرْمِي', '2fd': 'تَرْمِيَا', '2fp': 'تَرْمِينَ',
            '1s': 'أَرْمِ', '1p': 'نَرْمِ',
          },
          amr_malum: {
            '2ms': 'اِرْمِ', '2md': 'اِرْمِيَا', '2mp': 'اِرْمُوا',
            '2fs': 'اِرْمِي', '2fd': 'اِرْمِيَا', '2fp': 'اِرْمِينَ',
          },
        },
      },
    },
  },
];
