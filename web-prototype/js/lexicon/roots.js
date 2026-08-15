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
// forms.I.bab   → which of the six abwāb, by vowel pair: au ai aa ia uu ii
//                 (māḍī ʿayn vowel, then muḍāriʿ ʿayn vowel — vocabulary.js)
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
      I: { bab: 'au', gloss: 'to write', masdar: 'كِتَابَة', trans: true,
           en: { past: 'wrote', pp: 'written', pres3: 'writes', ing: 'writing' } },
    },
  },
  {
    root: ['ن', 'ص', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to help', masdar: 'نَصْر', trans: true,
           en: { past: 'helped', pp: 'helped', pres3: 'helps', ing: 'helping' } },
    },
  },
  {
    root: ['خ', 'ر', 'ج'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to go out', masdar: 'خُرُوج', trans: false,
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
      I: { bab: 'au', gloss: 'to look', masdar: 'نَظَر', trans: true,
           en: { past: 'looked', pp: 'looked at', pres3: 'looks', ing: 'looking' } },
      VIII: { gloss: 'to wait for', trans: true,
              en: { past: 'waited for', pp: 'waited for', pres3: 'waits for', ing: 'waiting for' } },
    },
  },
  {
    root: ['ق', 'ت', 'ل'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to kill', masdar: 'قَتْل', trans: true,
           en: { past: 'killed', pp: 'killed', pres3: 'kills', ing: 'killing' } },
      III: { gloss: 'to fight', trans: true,
             en: { past: 'fought', pp: 'fought', pres3: 'fights', ing: 'fighting' } },
    },
  },
  {
    root: ['ض', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 'ai', gloss: 'to hit', masdar: 'ضَرْب', trans: true,
           en: { past: 'hit', pp: 'hit', pres3: 'hits', ing: 'hitting' } },
    },
  },
  {
    root: ['ج', 'ل', 'س'], type: 'salim',
    forms: {
      I: { bab: 'ai', gloss: 'to sit', masdar: 'جُلُوس', trans: false,
           en: { past: 'sat', pres3: 'sits', ing: 'sitting' } },
    },
  },
  {
    root: ['ك', 'س', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'ai', gloss: 'to break', masdar: 'كَسْر', trans: true,
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
      I: { bab: 'ai', gloss: 'to forgive', masdar: 'مَغْفِرَة', trans: true,
           en: { past: 'forgave', pp: 'forgiven', pres3: 'forgives', ing: 'forgiving' } },
      X: { gloss: 'to seek forgiveness', trans: true,
           en: { past: 'sought forgiveness', pp: 'asked for forgiveness', pres3: 'seeks forgiveness', ing: 'seeking forgiveness' } },
    },
  },
  {
    root: ['ف', 'ت', 'ح'], type: 'salim',
    forms: {
      I: { bab: 'aa', gloss: 'to open', masdar: 'فَتْح', trans: true,
           en: { past: 'opened', pp: 'opened', pres3: 'opens', ing: 'opening' } },
    },
  },
  {
    root: ['ج', 'م', 'ع'], type: 'salim',
    forms: {
      I: { bab: 'aa', gloss: 'to gather', masdar: 'جَمْع', trans: true,
           en: { past: 'gathered', pp: 'gathered', pres3: 'gathers', ing: 'gathering' } },
      VIII: { gloss: 'to assemble / meet', trans: false,
              en: { past: 'assembled', pres3: 'assembles', ing: 'assembling' } },
    },
  },
  {
    root: ['ظ', 'ه', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'aa', gloss: 'to appear', masdar: 'ظُهُور', trans: false,
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
      I: { bab: 'ia', gloss: 'to hear', masdar: 'سَمْع', trans: true,
           en: { past: 'heard', pp: 'heard', pres3: 'hears', ing: 'hearing' } },
      VIII: { gloss: 'to listen', trans: false,
              en: { past: 'listened', pres3: 'listens', ing: 'listening' } },
    },
  },
  {
    root: ['ش', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 'ia', gloss: 'to drink', masdar: 'شُرْب', trans: true,
           en: { past: 'drank', pp: 'drunk', pres3: 'drinks', ing: 'drinking' } },
    },
  },
  {
    root: ['ع', 'ل', 'م'], type: 'salim',
    forms: {
      I: { bab: 'ia', gloss: 'to know', masdar: 'عِلْم', trans: true,
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
      I: { bab: 'ia', gloss: 'to be safe', masdar: 'سَلَامَة', trans: false },
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
      I: { bab: 'uu', gloss: 'to be noble', masdar: 'كَرَم', trans: false },
      IV: { gloss: 'to honor', trans: true,
            en: { past: 'honored', pp: 'honored', pres3: 'honors', ing: 'honoring' } },
    },
  },
  {
    root: ['ق', 'د', 'م'], type: 'salim',
    forms: {
      I: { bab: 'uu', gloss: 'to be old / ancient', masdar: 'قِدَم', trans: false },
      II: { gloss: 'to present / offer', trans: true,
            en: { past: 'presented', pp: 'presented', pres3: 'presents', ing: 'presenting' } },
      V: { gloss: 'to advance', trans: false,
           en: { past: 'advanced', pres3: 'advances', ing: 'advancing' } },
    },
  },
  {
    root: ['ح', 'س', 'ب'], type: 'salim',
    forms: {
      I: { bab: 'ii', gloss: 'to deem / suppose', masdar: 'حُسْبَان', trans: true,
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
      I: { bab: 'au', gloss: 'to stretch out / extend', masdar: 'مَدّ', trans: true,
           en: { past: 'stretched out', pp: 'stretched out', pres3: 'stretches out', ing: 'stretching out' } },
      IV: { gloss: 'to supply / reinforce', trans: true,
            en: { past: 'supplied', pp: 'supplied', pres3: 'supplies', ing: 'supplying' } },
      VIII: { gloss: 'to extend / stretch', trans: false,
              en: { past: 'extended', pres3: 'extends', ing: 'extending' } },
      X: { gloss: 'to seek help / draw from', trans: true,
           en: { past: 'drew on', pp: 'drawn on', pres3: 'draws on', ing: 'drawing on' } },
    },
  },
  {
    root: ['ر', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to return / send back', masdar: 'رَدّ', trans: true,
           en: { past: 'returned', pp: 'returned', pres3: 'returns', ing: 'returning' } },
      V: { gloss: 'to hesitate / frequent', trans: false,
           en: { past: 'hesitated', pres3: 'hesitates', ing: 'hesitating' } },
      VIII: { gloss: 'to turn back', trans: false,
              en: { past: 'turned back', pres3: 'turns back', ing: 'turning back' } },
      X: { gloss: 'to reclaim / get back', trans: true,
           en: { past: 'reclaimed', pp: 'reclaimed', pres3: 'reclaims', ing: 'reclaiming' } },
    },
  },
  {
    root: ['ح', 'ب', 'ب'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to love', masdar: 'حُبّ', trans: true,
           en: { past: 'loved', pp: 'loved', pres3: 'loves', ing: 'loving' } },
      IV: { gloss: 'to love', trans: true,
            en: { past: 'loved', pp: 'loved', pres3: 'loves', ing: 'loving' } },
      V: { gloss: 'to endear oneself', trans: false,
           en: { past: 'endeared himself', pres3: 'endears himself', ing: 'endearing himself' } },
      VI: { gloss: 'to love one another', trans: false,
            en: { past: 'loved one another', pres3: 'love one another', ing: 'loving one another' } },
      X: { gloss: 'to consider desirable', trans: true,
           en: { past: 'considered desirable', pp: 'considered desirable', pres3: 'considers desirable', ing: 'considering desirable' } },
    },
  },
  {
    root: ['ظ', 'ل', 'ل'], type: 'mudaaf',
    forms: {
      // bāb ia — the muḍāriʿ keeps the ʿayn's fatḥa: يَظَلُّ، and the
      // unfolded past shows the kasra the merge hid: ظَلِلْتُ
      I: { bab: 'ia', gloss: 'to remain / keep doing', masdar: 'ظُلُول', trans: false,
           en: { past: 'remained', pres3: 'remains', ing: 'remaining' } },
      II: { gloss: 'to shade / overshadow', trans: true,
            en: { past: 'shaded', pp: 'shaded', pres3: 'shades', ing: 'shading' } },
      IV: { gloss: 'to shade / loom over', trans: true,
            en: { past: 'loomed over', pp: 'loomed over', pres3: 'looms over', ing: 'looming over' } },
      X: { gloss: 'to seek shade', trans: false,
           en: { past: 'sought shade', pres3: 'seeks shade', ing: 'seeking shade' } },
    },
  },
  {
    root: ['م', 'ر', 'ر'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to pass by', masdar: 'مُرُور', trans: false,
           en: { past: 'passed by', pres3: 'passes by', ing: 'passing by' } },
      II: { gloss: 'to let pass / pass through', trans: true,
            en: { past: 'passed through', pp: 'passed through', pres3: 'passes through', ing: 'passing through' } },
      IV: { gloss: 'to make bitter', trans: true,
            en: { past: 'embittered', pp: 'embittered', pres3: 'embitters', ing: 'embittering' } },
      X: { gloss: 'to continue / persist', trans: false,
           en: { past: 'continued', pres3: 'continues', ing: 'continuing' } },
    },
  },
  {
    root: ['ع', 'ف', 'ف'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to be chaste', masdar: 'عِفَّة', trans: false },
      V: { gloss: 'to restrain oneself', trans: false,
           en: { past: 'restrained himself', pres3: 'restrains himself', ing: 'restraining himself' } },
      X: { gloss: 'to ask to be excused', trans: false,
           en: { past: 'asked to be excused', pres3: 'asks to be excused', ing: 'asking to be excused' } },
    },
  },
  {
    root: ['ق', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to cut lengthwise', masdar: 'قَدّ', trans: true,
           en: { past: 'cut', pp: 'cut', pres3: 'cuts', ing: 'cutting' } },
      VII: { gloss: 'to be split apart', trans: false,
             en: { past: 'was split apart', pres3: 'gets split apart', ing: 'getting split apart' } },
    },
  },
  {
    root: ['م', 'س', 'س'], type: 'mudaaf',
    forms: {
      I: { bab: 'aa', gloss: 'to touch', masdar: 'مَسّ', trans: true,
           en: { past: 'touched', pp: 'touched', pres3: 'touches', ing: 'touching' } },
      III: { gloss: 'to be in contact with', trans: true,
             en: { past: 'adjoined', pp: 'adjoined', pres3: 'adjoins', ing: 'adjoining' } },
      VI: { gloss: 'to touch each other', trans: false,
            en: { past: 'touched each other', pres3: 'touch each other', ing: 'touching each other' } },
    },
  },

  // -------------------------------------------------------------------------
  // Hand-authored irregulars. manualTables override the engine; slots they
  // don't cover simply aren't quizzed.
  // -------------------------------------------------------------------------
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
      },
    },
  },
  {
    root: ['ر', 'م', 'ي'], type: 'naqis_ya',
    forms: {
      I: {
        bab: 'ai', gloss: 'to throw', masdar: 'رَمْي', trans: true,
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

  // ===========================================================================
  // Weak-verb content, awaiting engines (P3–P4)
  //
  // These roots carry no manualTables, so isConjugatable() reports false and
  // they stay out of every quiz and every count until their conjugator lands.
  // They are here now because content authoring is parallel-track: the day
  // MithalConjugator ships, مِثَال becomes playable with eleven roots behind it
  // rather than one.
  //
  // Each is typed by which letter is weak (mithal_waw vs mithal_ya, …) because
  // that decides the iʿlāl. The user still sees one chip per traditional name.
  // ===========================================================================

  // --- Mithāl wāw · و as first radical ---------------------------------------
  {
    root: ['و', 'ج', 'ب'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to be obligatory', masdar: 'وُجُوب', trans: false,
           en: { past: 'became obligatory', pres3: 'becomes obligatory', ing: 'becoming obligatory' } },
      IV: { gloss: 'to make obligatory', trans: true,
            en: { past: 'obligated', pp: 'obligated', pres3: 'obligates', ing: 'obligating' } },
      X: { gloss: 'to deserve / merit', trans: true,
           en: { past: 'deserved', pp: 'deserved', pres3: 'deserves', ing: 'deserving' } },
    },
  },
  {
    root: ['و', 'ص', 'ل'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to reach / connect', masdar: 'وُصُول', trans: true,
           en: { past: 'reached', pp: 'reached', pres3: 'reaches', ing: 'reaching' } },
      II: { gloss: 'to connect / deliver', trans: true,
            en: { past: 'connected', pp: 'connected', pres3: 'connects', ing: 'connecting' } },
      III: { gloss: 'to keep in touch with', trans: true,
             en: { past: 'kept in touch with', pp: 'kept in touch with', pres3: 'keeps in touch with', ing: 'keeping in touch with' } },
      IV: { gloss: 'to deliver / bring to', trans: true,
            en: { past: 'delivered', pp: 'delivered', pres3: 'delivers', ing: 'delivering' } },
      V: { gloss: 'to arrive at a result', trans: false,
           en: { past: 'arrived at', pres3: 'arrives at', ing: 'arriving at' } },
      VI: { gloss: 'to stay in touch', trans: false,
            en: { past: 'stayed in touch', pres3: 'stays in touch', ing: 'staying in touch' } },
      VIII: { gloss: 'to contact / call', trans: true,
              en: { past: 'contacted', pp: 'contacted', pres3: 'contacts', ing: 'contacting' } },
    },
  },
  {
    root: ['و', 'ج', 'د'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to find', masdar: 'وُجُود', trans: true,
           en: { past: 'found', pp: 'found', pres3: 'finds', ing: 'finding' } },
      IV: { gloss: 'to bring into existence', trans: true,
            en: { past: 'created', pp: 'created', pres3: 'creates', ing: 'creating' } },
    },
  },
  {
    root: ['و', 'ق', 'ع'], type: 'mithal_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to fall / happen', masdar: 'وُقُوع', trans: false,
           en: { past: 'happened', pres3: 'happens', ing: 'happening' } },
      II: { gloss: 'to sign', trans: true,
            en: { past: 'signed', pp: 'signed', pres3: 'signs', ing: 'signing' } },
      III: { gloss: 'to confront / engage with', trans: true,
             en: { past: 'confronted', pp: 'confronted', pres3: 'confronts', ing: 'confronting' } },
      IV: { gloss: 'to inflict / cause to fall', trans: true,
            en: { past: 'inflicted', pp: 'inflicted', pres3: 'inflicts', ing: 'inflicting' } },
      VI: { gloss: 'to clash with one another', trans: false,
            en: { past: 'clashed', pres3: 'clash', ing: 'clashing' } },
    },
  },
  {
    root: ['و', 'ض', 'ع'], type: 'mithal_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to put / place', masdar: 'وَضْع', trans: true,
           en: { past: 'put', pp: 'put', pres3: 'puts', ing: 'putting' } },
      III: { gloss: 'to compose together', trans: true,
             en: { past: 'drafted together', pp: 'drafted together', pres3: 'drafts together', ing: 'drafting together' } },
      VI: { gloss: 'to be humble', trans: false,
            en: { past: 'was humble', pres3: 'is humble', ing: 'being humble' } },
      VIII: { gloss: 'to be lowered / humbled', trans: false,
              en: { past: 'was humbled', pres3: 'gets humbled', ing: 'getting humbled' } },
    },
  },
  {
    root: ['و', 'ه', 'ب'], type: 'mithal_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to grant / bestow', masdar: 'هِبَة', trans: true,
           en: { past: 'granted', pp: 'granted', pres3: 'grants', ing: 'granting' } },
      X: { gloss: 'to ask for a gift', trans: true,
           en: { past: 'asked for a gift', pp: 'asked of', pres3: 'asks for a gift', ing: 'asking for a gift' } },
    },
  },
  {
    root: ['و', 'ج', 'ل'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ia', gloss: 'to fear / be afraid', masdar: 'وَجَل', trans: false,
           en: { past: 'feared', pres3: 'fears', ing: 'fearing' } },
      IV: { gloss: 'to frighten', trans: true,
            en: { past: 'frightened', pp: 'frightened', pres3: 'frightens', ing: 'frightening' } },
    },
  },
  {
    root: ['و', 'ج', 'ع'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ia', gloss: 'to hurt / feel pain', masdar: 'وَجَع', trans: false,
           en: { past: 'hurt', pres3: 'hurts', ing: 'hurting' } },
      IV: { gloss: 'to cause pain to', trans: true,
            en: { past: 'caused pain to', pp: 'pained', pres3: 'causes pain to', ing: 'causing pain to' } },
    },
  },
  {
    root: ['و', 'ث', 'ق'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to trust', masdar: 'ثِقَة', trans: false,
           en: { past: 'trusted', pres3: 'trusts', ing: 'trusting' } },
      II: { gloss: 'to document / verify', trans: true,
            en: { past: 'documented', pp: 'documented', pres3: 'documents', ing: 'documenting' } },
      III: { gloss: 'to make a covenant with', trans: true,
             en: { past: 'made a pact with', pp: 'covenanted with', pres3: 'makes a pact with', ing: 'making a pact with' } },
      IV: { gloss: 'to bind firmly', trans: true,
            en: { past: 'bound firmly', pp: 'bound firmly', pres3: 'binds firmly', ing: 'binding firmly' } },
      V: { gloss: 'to make sure / verify', trans: false,
           en: { past: 'made sure', pres3: 'makes sure', ing: 'making sure' } },
      VI: { gloss: 'to make a mutual pact', trans: false,
            en: { past: 'made a mutual pact', pres3: 'make a mutual pact', ing: 'making a mutual pact' } },
    },
  },
  {
    root: ['و', 'ج', 'ه'], type: 'mithal_waw',
    forms: {
      I: { bab: 'uu', gloss: 'to be distinguished', masdar: 'وَجَاهَة', trans: false },
      II: { gloss: 'to direct / orient', trans: true,
            en: { past: 'directed', pp: 'directed', pres3: 'directs', ing: 'directing' } },
      III: { gloss: 'to face / confront', trans: true,
             en: { past: 'faced', pp: 'faced', pres3: 'faces', ing: 'facing' } },
      V: { gloss: 'to head towards', trans: false,
           en: { past: 'headed towards', pres3: 'heads towards', ing: 'heading towards' } },
      VI: { gloss: 'to face one another', trans: false,
            en: { past: 'faced one another', pres3: 'face one another', ing: 'facing one another' } },
    },
  },
  {
    root: ['و', 'ر', 'ث'], type: 'mithal_waw',
    forms: {
      // Source notes read "abb" for the vowel pair, which is not one of the six
      // — وَرِثَ يَرِثُ is kasra/kasra, so `ii`. Flagged for your check.
      I: { bab: 'ii', gloss: 'to inherit', masdar: 'إِرْث', trans: true,
           en: { past: 'inherited', pp: 'inherited', pres3: 'inherits', ing: 'inheriting' } },
      II: { gloss: 'to bequeath / pass down', trans: true,
            en: { past: 'bequeathed', pp: 'bequeathed', pres3: 'bequeaths', ing: 'bequeathing' } },
      IV: { gloss: 'to cause to inherit', trans: true,
            en: { past: 'passed on', pp: 'passed on', pres3: 'passes on', ing: 'passing on' } },
      V: { gloss: 'to be inherited', trans: false,
           en: { past: 'was inherited', pres3: 'gets inherited', ing: 'getting inherited' } },
      VI: { gloss: 'to inherit from one another', trans: false,
            en: { past: 'inherited from one another', pres3: 'inherit from one another', ing: 'inheriting from one another' } },
    },
  },

  // --- Mithāl yāʾ · ي as first radical ---------------------------------------
  // Both are also hamzated (يَئِسَ) or near it; classify() types them by their
  // weakness, which is the harder rule and the one that decides the engine.
  {
    root: ['ي', 'ء', 'س'], type: 'mithal_ya',
    forms: {
      I: { bab: 'ia', gloss: 'to despair', masdar: 'يَأْس', trans: false,
           en: { past: 'despaired', pres3: 'despairs', ing: 'despairing' } },
      IV: { gloss: 'to cause to despair', trans: true,
            en: { past: 'drove to despair', pp: 'driven to despair', pres3: 'drives to despair', ing: 'driving to despair' } },
      X: { gloss: 'to give up all hope', trans: false,
           en: { past: 'gave up hope', pres3: 'gives up hope', ing: 'giving up hope' } },
    },
  },
  {
    root: ['ي', 'ق', 'ن'], type: 'mithal_ya',
    forms: {
      I: { bab: 'ia', gloss: 'to be certain', masdar: 'يَقِين', trans: false,
           en: { past: 'was certain', pres3: 'is certain', ing: 'being certain' } },
      IV: { gloss: 'to ascertain', trans: true,
            en: { past: 'ascertained', pp: 'ascertained', pres3: 'ascertains', ing: 'ascertaining' } },
      V: { gloss: 'to make sure', trans: false,
           en: { past: 'made sure', pres3: 'makes sure', ing: 'making sure' } },
      X: { gloss: 'to be fully certain of', trans: true,
           en: { past: 'was fully certain of', pp: 'ascertained', pres3: 'is fully certain of', ing: 'being fully certain of' } },
    },
  },

  // --- Ajwaf wāw · و as middle radical ---------------------------------------
  {
    root: ['ن', 'و', 'م'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to sleep', masdar: 'نَوْم', trans: false,
           en: { past: 'slept', pres3: 'sleeps', ing: 'sleeping' } },
      II: { gloss: 'to put to sleep', trans: true,
            en: { past: 'put to sleep', pp: 'put to sleep', pres3: 'puts to sleep', ing: 'putting to sleep' } },
      IV: { gloss: 'to lay down / put to sleep', trans: true,
            en: { past: 'laid down', pp: 'laid down', pres3: 'lays down', ing: 'laying down' } },
      X: { gloss: 'to feel at ease', trans: false,
           en: { past: 'felt at ease', pres3: 'feels at ease', ing: 'feeling at ease' } },
    },
  },
  {
    root: ['خ', 'و', 'ف'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to fear', masdar: 'خَوْف', trans: true,
           en: { past: 'feared', pp: 'feared', pres3: 'fears', ing: 'fearing' } },
      II: { gloss: 'to frighten / intimidate', trans: true,
            en: { past: 'frightened', pp: 'frightened', pres3: 'frightens', ing: 'frightening' } },
      IV: { gloss: 'to scare', trans: true,
            en: { past: 'scared', pp: 'scared', pres3: 'scares', ing: 'scaring' } },
      V: { gloss: 'to be apprehensive', trans: false,
           en: { past: 'was apprehensive', pres3: 'is apprehensive', ing: 'being apprehensive' } },
    },
  },
  {
    root: ['م', 'و', 'ت'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'au', gloss: 'to die', masdar: 'مَوْت', trans: false,
           en: { past: 'died', pres3: 'dies', ing: 'dying' } },
      IV: { gloss: 'to cause to die', trans: true,
            en: { past: 'put to death', pp: 'put to death', pres3: 'puts to death', ing: 'putting to death' } },
      V: { gloss: 'to feign death', trans: false,
           en: { past: 'feigned death', pres3: 'feigns death', ing: 'feigning death' } },
      X: { gloss: 'to fight to the death', trans: false,
           en: { past: 'fought to the death', pres3: 'fights to the death', ing: 'fighting to the death' } },
    },
  },
  {
    root: ['ز', 'و', 'ر'], type: 'ajwaf_waw',
    forms: {
      I: { bab: 'au', gloss: 'to visit', masdar: 'زِيَارَة', trans: true,
           en: { past: 'visited', pp: 'visited', pres3: 'visits', ing: 'visiting' } },
      II: { gloss: 'to forge / falsify', trans: true,
            en: { past: 'forged', pp: 'forged', pres3: 'forges', ing: 'forging' } },
      VI: { gloss: 'to visit one another', trans: false,
            en: { past: 'visited one another', pres3: 'visit one another', ing: 'visiting one another' } },
    },
  },

  // --- Ajwaf yāʾ · ي as middle radical ---------------------------------------
  {
    root: ['س', 'ي', 'ر'], type: 'ajwaf_ya',
    forms: {
      I: { bab: 'ai', gloss: 'to travel / journey', masdar: 'سَيْر', trans: false,
           en: { past: 'travelled', pres3: 'travels', ing: 'travelling' } },
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
           en: { past: 'sold', pp: 'sold', pres3: 'sells', ing: 'selling' } },
      III: { gloss: 'to pledge allegiance to', trans: true,
             en: { past: 'pledged allegiance to', pp: 'pledged allegiance to', pres3: 'pledges allegiance to', ing: 'pledging allegiance to' } },
      VI: { gloss: 'to trade with each other', trans: false,
            en: { past: 'traded with each other', pres3: 'trade with each other', ing: 'trading with each other' } },
      VIII: { gloss: 'to buy / purchase', trans: true,
              en: { past: 'bought', pp: 'bought', pres3: 'buys', ing: 'buying' } },
    },
  },
  {
    root: ['ن', 'ي', 'ل'], type: 'ajwaf_ya',
    forms: {
      I: { bab: 'aa', gloss: 'to obtain / attain', masdar: 'نَيْل', trans: true,
           en: { past: 'obtained', pp: 'obtained', pres3: 'obtains', ing: 'obtaining' } },
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

  // --- Nāqiṣ wāw · و as final radical ----------------------------------------
  {
    root: ['د', 'ع', 'و'], type: 'naqis_waw',
    forms: {
      I: { bab: 'au', gloss: 'to call / invite', masdar: 'دَعْوَة', trans: true,
           en: { past: 'called', pp: 'called', pres3: 'calls', ing: 'calling' } },
      VI: { gloss: 'to call on one another', trans: false,
            en: { past: 'called on one another', pres3: 'call on one another', ing: 'calling on one another' } },
      VIII: { gloss: 'to claim / allege', trans: true,
              en: { past: 'claimed', pp: 'claimed', pres3: 'claims', ing: 'claiming' } },
    },
  },
  {
    root: ['ن', 'ع', 'و'], type: 'naqis_waw',
    forms: {
      I: { bab: 'au', gloss: 'to announce a death', masdar: 'نَعْي', trans: true,
           en: { past: 'announced the death of', pp: 'mourned', pres3: 'announces the death of', ing: 'announcing the death of' } },
    },
  },

  // --- Nāqiṣ yāʾ · ي as final radical ----------------------------------------
  {
    root: ['ق', 'ض', 'ي'], type: 'naqis_ya',
    forms: {
      I: { bab: 'ai', gloss: 'to decide / judge', masdar: 'قَضَاء', trans: true,
           en: { past: 'judged', pp: 'judged', pres3: 'judges', ing: 'judging' } },
      III: { gloss: 'to take to court', trans: true,
             en: { past: 'sued', pp: 'sued', pres3: 'sues', ing: 'suing' } },
      VI: { gloss: 'to sue each other', trans: false,
            en: { past: 'sued each other', pres3: 'sue each other', ing: 'suing each other' } },
      VII: { gloss: 'to elapse / come to an end', trans: false,
             en: { past: 'elapsed', pres3: 'elapses', ing: 'elapsing' } },
      VIII: { gloss: 'to require / necessitate', trans: true,
              en: { past: 'required', pp: 'required', pres3: 'requires', ing: 'requiring' } },
    },
  },
  {
    root: ['س', 'ع', 'ي'], type: 'naqis_ya',
    forms: {
      I: { bab: 'aa', gloss: 'to strive / endeavour', masdar: 'سَعْي', trans: false,
           en: { past: 'strove', pres3: 'strives', ing: 'striving' } },
      X: { gloss: 'to ask someone to make an effort', trans: true,
           en: { past: 'asked to make an effort', pp: 'called upon', pres3: 'asks to make an effort', ing: 'asking to make an effort' } },
    },
  },
  {
    root: ['ر', 'ض', 'ي'], type: 'naqis_ya',
    forms: {
      I: { bab: 'ia', gloss: 'to be pleased / content', masdar: 'رِضًا', trans: false,
           en: { past: 'was pleased', pres3: 'is pleased', ing: 'being pleased' } },
      III: { gloss: 'to appease', trans: true,
             en: { past: 'appeased', pp: 'appeased', pres3: 'appeases', ing: 'appeasing' } },
      IV: { gloss: 'to satisfy / please', trans: true,
            en: { past: 'satisfied', pp: 'satisfied', pres3: 'satisfies', ing: 'satisfying' } },
      VI: { gloss: 'to reach mutual agreement', trans: false,
            en: { past: 'reached mutual agreement', pres3: 'reach mutual agreement', ing: 'reaching mutual agreement' } },
      VIII: { gloss: 'to approve of', trans: true,
              en: { past: 'approved of', pp: 'approved of', pres3: 'approves of', ing: 'approving of' } },
    },
  },
];
