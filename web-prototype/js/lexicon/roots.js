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
      // bāb ai — the muḍāriʿ keeps the ʿayn's kasra: يَظِلُّ، and the
      // unfolded past shows the fatḥa the merge hid: ظَلَلْتُ
      I: { bab: 'ai', gloss: 'to remain / keep doing', masdar: 'ظُلُول', trans: false,
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

  {
    root: ['ض', 'ل', 'ل'], type: 'mudaaf',
    forms: {
      // ضَلَّ يَضِلُّ, bab ضَرَبَ. The doublet ضَلَّ يَضَلُّ (Ḥijāzī) is also
      // classical; the kasra form is the one the Qurʾān reads (لَا يَضِلُّ
      // رَبِّي), and a root entry holds one Form I.
      I: { bab: 'ai', gloss: 'to go astray', masdar: 'ضَلَال', trans: false,
           en: { past: 'went astray', pres3: 'goes astray', ing: 'going astray' } },
      II: { gloss: 'to declare misguided', trans: true,
            en: { past: 'declared misguided', pp: 'declared misguided', pres3: 'declares misguided', ing: 'declaring misguided' } },
      IV: { gloss: 'to lead astray', trans: true,
            en: { past: 'led astray', pp: 'led astray', pres3: 'leads astray', ing: 'leading astray' } },
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
      // The mazīd forms carry no fixtures and never did: manualTables were only
      // ever a stand-in for a missing ENGINE, and the ajwaf engine has been
      // authoring III–X for as long as it has existed. These go through it.
      III: { gloss: 'to negotiate with', trans: true,
             en: { past: 'negotiated with', pp: 'negotiated with', pres3: 'negotiates with', ing: 'negotiating with' } },
      IV: { gloss: 'to release from a contract', trans: true,
            en: { past: 'released', pp: 'released', pres3: 'releases', ing: 'releasing' } },
      V: { gloss: 'to fabricate a saying against', trans: true,
           en: { past: 'fabricated against', pp: 'fabricated against', pres3: 'fabricates against', ing: 'fabricating against' } },
      VI: { gloss: 'to converse with one another', trans: false,
            en: { past: 'conversed with one another', pres3: 'converse with one another', ing: 'conversing with one another' } },
      X: { gloss: 'to resign', trans: false,
           en: { past: 'resigned', pres3: 'resigns', ing: 'resigning' } },
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
      // Form I is fixture-checked; VI and VIII are the naqis mazīd tables
      // (ROADMAP B1) doing the work, same as قضي and رضي.
      VI: { gloss: 'to shoot at one another', trans: false,
            en: { past: 'shot at one another', pres3: 'shoot at one another', ing: 'shooting at one another' } },
      VIII: { gloss: 'to fling oneself', trans: false,
              en: { past: 'flung himself', pres3: 'flings himself', ing: 'flinging himself' } },
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

  {
    root: ['و', 'ع', 'د'], type: 'mithal_waw',
    forms: {
      // The textbook mithāl: the kasra on the ʿayn crushes the wāw out of the
      // muḍāriʿ entirely — وَعَدَ يَعِدُ, no wāw left to see.
      I: { bab: 'ai', gloss: 'to promise', masdar: 'وَعْد', trans: true,
           en: { past: 'promised', pp: 'promised', pres3: 'promises', ing: 'promising' } },
      III: { gloss: 'to make an appointment with', trans: true,
             en: { past: 'made an appointment with', pp: 'appointed with', pres3: 'makes an appointment with', ing: 'making an appointment with' } },
      IV: { gloss: 'to threaten', trans: true,
            en: { past: 'threatened', pp: 'threatened', pres3: 'threatens', ing: 'threatening' } },
      V: { gloss: 'to threaten repeatedly', trans: true,
           en: { past: 'threatened', pp: 'threatened', pres3: 'threatens', ing: 'threatening' } },
      VI: { gloss: 'to promise one another', trans: false,
            en: { past: 'promised one another', pres3: 'promise one another', ing: 'promising one another' } },
      // اِتَّعَدَ — the faa vanishes into the taa. This is the root that exercises
      // MITHAL_STEMS.VIII, whose templates never mention radical 1.
      VIII: { gloss: 'to accept a promise', trans: true,
              en: { past: 'accepted a promise', pp: 'accepted', pres3: 'accepts a promise', ing: 'accepting a promise' } },
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
  {
    root: ['ي', 'م', 'ن'], type: 'mithal_ya',
    forms: {
      I: { bab: 'aa', gloss: 'to be lucky / blessed', masdar: 'يُمْن', trans: true,
           en: { past: 'was lucky', pres3: 'is lucky', ing: 'being lucky' } },
      II: { gloss: 'to go to the right', trans: true,
            en: { past: 'went to the right', pp: 'went to the right', pres3: 'goes to the right', ing: 'going to the right' } },
      V: { gloss: 'to see a good omen', trans: false,
           en: { past: 'saw a good omen', pres3: 'sees a good omen', ing: 'seeing a good omen' } },
    },
  },
  {
    root: ['ي', 'ق', 'ظ'], type: 'mithal_ya',
    forms: {
      // يَقُظَ يَيْقُظُ, bab كَرُمَ. The dictionaries also carry the doublet
      // يَقِظَ يَيْقَظُ (bab ia, masdar يَقَظ) for the same meaning; only the
      // damma form is listed, since a root entry holds one Form I.
      I: { bab: 'ia', gloss: 'to be awake / vigilant', masdar: 'يَقَاظَة', trans: false },
      IV: { gloss: 'to wake someone up', trans: true,
            en: { past: 'woke up', pp: 'woken up', pres3: 'wakes up', ing: 'waking up' } },
      V: { gloss: 'to become alert', trans: false,
           en: { past: 'became alert', pres3: 'becomes alert', ing: 'becoming alert' } },
      X: { gloss: 'to wake up', trans: false,
           en: { past: 'woke up', pres3: 'wakes up', ing: 'waking up' } },
    },
  },

  {
    root: ['ي', 'ف', 'ع'], type: 'mithal_ya',
    forms: {
      // bab فَتَحَ, which needs a ḥarf ḥalq to license the fatḥa — the ʿayn as
      // lām supplies it here. The first `aa` mithāl yāʾ in the lexicon.
      I: { bab: 'aa', gloss: 'to reach adolescence', masdar: 'يَفَاعَة', trans: false,
           en: { past: 'reached adolescence', pres3: 'reaches adolescence', ing: 'reaching adolescence' } },
      // أَيْفَعَ is in fact the commoner of the two in use; form I is kept as the
      // headword because the bab is what a sarf student is asked to name.
      IV: { gloss: 'to come of age', trans: false,
            en: { past: 'came of age', pres3: 'comes of age', ing: 'coming of age' } },
    },
  },
  {
    root: ['ي', 'ت', 'م'], type: 'mithal_ya',
    forms: {
      // يَتُمَ يَيْتُمُ, bab كَرُمَ — the form given here. Dictionaries also carry
      // يَتِمَ يَيْتَمُ (bab ia) and يَتَمَ يَيْتِمُ (bab ai) for the same meaning;
      // a root entry holds one Form I, and this is the ḍamma one.
      I: { bab: 'uu', gloss: 'to be orphaned', masdar: 'يُتْم', trans: false },
      II: { gloss: 'to orphan', trans: true,
            en: { past: 'orphaned', pp: 'orphaned', pres3: 'orphans', ing: 'orphaning' } },
      IV: { gloss: 'to make an orphan of', trans: true,
            en: { past: 'made an orphan of', pp: 'orphaned', pres3: 'makes an orphan of', ing: 'making an orphan of' } },
    },
  },
  {
    root: ['ي', 'س', 'ر'], type: 'mithal_ya',
    forms: {
      // يَسِرَ يَيْسَرُ, bab سَمِعَ — the form given here. The doublet يَسَرَ
      // يَيْسِرُ (bab ai) means rather "to gamble / draw lots"; different sense,
      // so this is not the same verb wearing another bab.
      I: { bab: 'ia', gloss: 'to be easy', masdar: 'يُسْر', trans: false },
      II: { gloss: 'to make easy', trans: true,
            en: { past: 'made easy', pp: 'made easy', pres3: 'makes easy', ing: 'making easy' } },
      IV: { gloss: 'to become well off', trans: false,
            en: { past: 'became well off', pres3: 'becomes well off', ing: 'becoming well off' } },
      V: { gloss: 'to become easy', trans: false,
           en: { past: 'became easy', pres3: 'becomes easy', ing: 'becoming easy' } },
      X: { gloss: 'to be made easy', trans: false,
           en: { past: 'was made easy', pres3: 'is made easy', ing: 'being made easy' } },
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

  {
    root: ['ص', 'و', 'م'], type: 'ajwaf_waw',
    forms: {
      // Form I only, and that is a finding rather than a gap: صَوَّمَ and أَصَامَ
      // are both in the dictionaries but neither is in live use, and a mazīd
      // form nobody says is a distractor a quiz would offer as a real word.
      // صِيَام is the commoner NOUN; صَوْم is the maṣdar proper.
      I: { bab: 'au', gloss: 'to fast', masdar: 'صَوْم', trans: false,
           en: { past: 'fasted', pres3: 'fasts', ing: 'fasting' } },
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

  {
    root: ['ب', 'ي', 'ت'], type: 'ajwaf_ya',
    forms: {
      // The lām is تاء, which is what the 1s and 2nd-person endings open with —
      // so the mutaḥarrik slots merge across the join (بِتُّ, not بِتْتُ), the
      // one place joinEnding()'s idghām fires for a non-muḍāʿaf root.
      I: { bab: 'ai', gloss: 'to spend the night', masdar: 'بَيْتُوتَة', trans: false,
           en: { past: 'spent the night', pres3: 'spends the night', ing: 'spending the night' } },
      II: { gloss: 'to plot by night', trans: true,
            en: { past: 'plotted by night', pp: 'plotted by night', pres3: 'plots by night', ing: 'plotting by night' } },
      IV: { gloss: 'to lodge for the night', trans: true,
            en: { past: 'lodged', pp: 'lodged', pres3: 'lodges', ing: 'lodging' } },
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

  {
    root: ['ب', 'ه', 'و'], type: 'naqis_waw',
    forms: {
      // The third waw-lām root, and the first to reach the mazīd tables — where
      // its wāw surfaces as a yāʾ (بَاهَى · تَبَاهَى), the rule NAQIS_STEMS'
      // mazīd header states. دعو only ever gets there through VI and VIII.
      I: { bab: 'au', gloss: 'to be splendid', masdar: 'بَهَاء', trans: false },
      III: { gloss: 'to vie in glory with', trans: true,
             en: { past: 'vied with', pp: 'vied with', pres3: 'vies with', ing: 'vying with' } },
      VI: { gloss: 'to boast to one another', trans: false,
            en: { past: 'boasted to one another', pres3: 'boast to one another', ing: 'boasting to one another' } },
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
  {
    root: ['ه', 'د', 'ي'], type: 'naqis_ya',
    forms: {
      I: { bab: 'ai', gloss: 'to guide', masdar: 'هُدًى', trans: true,
           en: { past: 'guided', pp: 'guided', pres3: 'guides', ing: 'guiding' } },
      IV: { gloss: 'to give as a gift', trans: true,
            en: { past: 'gave as a gift', pp: 'given as a gift', pres3: 'gives as a gift', ing: 'giving as a gift' } },
      VI: { gloss: 'to exchange gifts', trans: false,
            en: { past: 'exchanged gifts', pres3: 'exchange gifts', ing: 'exchanging gifts' } },
      VIII: { gloss: 'to be rightly guided', trans: false,
              en: { past: 'was rightly guided', pres3: 'is rightly guided', ing: 'being rightly guided' } },
      X: { gloss: 'to seek guidance', trans: false,
           en: { past: 'sought guidance', pres3: 'seeks guidance', ing: 'seeking guidance' } },
    },
  },
  {
    root: ['ب', 'ق', 'ي'], type: 'naqis_ya',
    forms: {
      // bab سَمِعَ — the one nāqiṣ bab whose lām survives almost everywhere,
      // because the kasra on the ʿayn makes the yāʾ pronounceable. Same shape
      // as رَضِيَ, and the second root to exercise it.
      I: { bab: 'ia', gloss: 'to remain', masdar: 'بَقَاء', trans: false,
           en: { past: 'remained', pres3: 'remains', ing: 'remaining' } },
      II: { gloss: 'to leave over', trans: true,
            en: { past: 'left over', pp: 'left over', pres3: 'leaves over', ing: 'leaving over' } },
      IV: { gloss: 'to spare', trans: true,
            en: { past: 'spared', pp: 'spared', pres3: 'spares', ing: 'sparing' } },
      X: { gloss: 'to keep alive', trans: true,
           en: { past: 'kept alive', pp: 'kept alive', pres3: 'keeps alive', ing: 'keeping alive' } },
    },
  },
  {
    "root": [
      "س",
      "م",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%85%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to be high / to rise",
        "masdar": "سُمُوّ",
        "trans": false,
        "en": {
          "past": "rose",
          "pres3": "rises",
          "ing": "rising"
        }
      },
      "II": {
        "gloss": "to name / to call",
        "masdar": "تَسْمِيَة",
        "trans": true,
        "en": {
          "past": "named",
          "pp": "named",
          "pres3": "names",
          "ing": "naming"
        }
      },
      "III": {
        "gloss": "to vie with in glory",
        "masdar": "مُسَامَاة",
        "trans": true,
        "en": {
          "past": "vied with",
          "pp": "vied with",
          "pres3": "vies with",
          "ing": "vying with"
        }
      },
      "IV": {
        "gloss": "to elevate / to raise up",
        "masdar": "إِسْمَاء",
        "trans": true,
        "en": {
          "past": "elevated",
          "pp": "elevated",
          "pres3": "elevates",
          "ing": "elevating"
        }
      },
      "V": {
        "gloss": "to be named / to go by the name of",
        "masdar": "تَسَمٍّ",
        "trans": false,
        "en": {
          "past": "was named",
          "pres3": "is named",
          "ing": "being named"
        }
      },
      "VI": {
        "gloss": "to rise high / to vie with one another",
        "masdar": "تَسَامٍ",
        "trans": false,
        "en": {
          "past": "rose high",
          "pres3": "rises high",
          "ing": "rising high"
        }
      }
    }
  },
  {
    "root": [
      "ر",
      "ب",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B1%D8%A8%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to grow / to increase",
        "masdar": "رُبُوّ",
        "trans": false,
        "en": {
          "past": "grew",
          "pres3": "grows",
          "ing": "growing"
        }
      },
      "II": {
        "gloss": "to raise / to bring up / to educate",
        "masdar": "تَرْبِيَة",
        "trans": true,
        "en": {
          "past": "raised",
          "pp": "raised",
          "pres3": "raises",
          "ing": "raising"
        }
      },
      "III": {
        "gloss": "to practise usury with",
        "masdar": "مُرَابَاة",
        "trans": true,
        "en": {
          "past": "lent at interest to",
          "pp": "lent at interest to",
          "pres3": "lends at interest to",
          "ing": "lending at interest to"
        }
      },
      "IV": {
        "gloss": "to exceed / to surpass",
        "masdar": "إِرْبَاء",
        "trans": false,
        "en": {
          "past": "exceeded",
          "pres3": "exceeds",
          "ing": "exceeding"
        }
      },
      "V": {
        "gloss": "to be brought up / to be reared",
        "masdar": "تَرَبٍّ",
        "trans": false,
        "en": {
          "past": "was raised",
          "pres3": "is raised",
          "ing": "being raised"
        }
      }
    }
  },
  {
    "root": [
      "ل",
      "ب",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%84%D8%A8%D9%91%D9%89.html",
    "note": "Form I is archaic; in MSA this root is effectively Form II only.",
    "forms": {
      "II": {
        "gloss": "to comply with / to answer (a call) / to meet (a need)",
        "masdar": "تَلْبِيَة",
        "trans": true,
        "en": {
          "past": "complied with",
          "pp": "complied with",
          "pres3": "complies with",
          "ing": "complying with"
        }
      }
    }
  },
  {
    "root": [
      "ح",
      "ي",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AD%D9%8A%D9%91%D8%A7.html",
    "note": "Technically lafīf maqrūn (ʿayn and lām both yāʾ); Form II is written حَيَّا with alif.",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to live",
        "masdar": "حَيَاة",
        "trans": false,
        "en": {
          "past": "lived",
          "pres3": "lives",
          "ing": "living"
        }
      },
      "II": {
        "gloss": "to greet / to salute",
        "masdar": "تَحِيَّة",
        "trans": true,
        "en": {
          "past": "greeted",
          "pp": "greeted",
          "pres3": "greets",
          "ing": "greeting"
        }
      },
      "IV": {
        "gloss": "to bring to life / to revive",
        "masdar": "إِحْيَاء",
        "trans": true,
        "en": {
          "past": "revived",
          "pp": "revived",
          "pres3": "revives",
          "ing": "reviving"
        }
      },
      "X": {
        "gloss": "to be ashamed / to feel shy",
        "masdar": "اِسْتِحْيَاء",
        "trans": false,
        "en": {
          "past": "was ashamed",
          "pres3": "is ashamed",
          "ing": "being ashamed"
        }
      }
    }
  },
  {
    "root": [
      "ق",
      "و",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%88%D9%91%D9%89.html",
    "note": "Lafīf maqrūn root; the doubled ʿayn in Form II makes it conjugate as plain nāqiṣ.",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to be strong",
        "masdar": "قُوَّة",
        "trans": false,
        "en": {
          "past": "was strong",
          "pres3": "is strong",
          "ing": "being strong"
        }
      },
      "II": {
        "gloss": "to strengthen / to reinforce",
        "masdar": "تَقْوِيَة",
        "trans": true,
        "en": {
          "past": "strengthened",
          "pp": "strengthened",
          "pres3": "strengthens",
          "ing": "strengthening"
        }
      },
      "V": {
        "gloss": "to grow strong / to gain strength",
        "masdar": "تَقَوٍّ",
        "trans": false,
        "en": {
          "past": "grew strong",
          "pres3": "grows strong",
          "ing": "growing strong"
        }
      },
      "X": {
        "gloss": "to become strong / to gather strength",
        "masdar": "اِسْتِقْوَاء",
        "trans": false,
        "en": {
          "past": "became strong",
          "pres3": "becomes strong",
          "ing": "becoming strong"
        }
      }
    }
  },
  {
    "root": [
      "س",
      "و",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%88%D9%91%D9%89.html",
    "note": "Lafīf maqrūn root; Form II conjugates as plain nāqiṣ.",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to be worth / to be equal to",
        "masdar": "سِوًى",
        "trans": true,
        "en": {
          "past": "was worth",
          "pp": "worth",
          "pres3": "is worth",
          "ing": "being worth"
        }
      },
      "II": {
        "gloss": "to level / to settle / to make equal",
        "masdar": "تَسْوِيَة",
        "trans": true,
        "en": {
          "past": "levelled",
          "pp": "levelled",
          "pres3": "levels",
          "ing": "levelling"
        }
      },
      "III": {
        "gloss": "to equal / to be worth",
        "masdar": "مُسَاوَاة",
        "trans": true,
        "en": {
          "past": "equalled",
          "pp": "equalled",
          "pres3": "equals",
          "ing": "equalling"
        }
      },
      "VI": {
        "gloss": "to be equal to one another",
        "masdar": "تَسَاوٍ",
        "trans": false,
        "en": {
          "past": "were equal",
          "pres3": "are equal",
          "ing": "being equal"
        }
      },
      "VIII": {
        "gloss": "to be level / to be even / to settle upon",
        "masdar": "اِسْتِوَاء",
        "trans": false,
        "en": {
          "past": "was level",
          "pres3": "is level",
          "ing": "being level"
        }
      }
    }
  },
  {
    "root": [
      "ع",
      "ز",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B9%D8%B2%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to be patient / to bear with fortitude",
        "masdar": "عَزَاء",
        "trans": false,
        "en": {
          "past": "bore patiently",
          "pres3": "bears patiently",
          "ing": "bearing patiently"
        }
      },
      "II": {
        "gloss": "to console / to offer condolences to",
        "masdar": "تَعْزِيَة",
        "trans": true,
        "en": {
          "past": "consoled",
          "pp": "consoled",
          "pres3": "consoles",
          "ing": "consoling"
        }
      },
      "V": {
        "gloss": "to be consoled / to take comfort",
        "masdar": "تَعَزٍّ",
        "trans": false,
        "en": {
          "past": "took comfort",
          "pres3": "takes comfort",
          "ing": "taking comfort"
        }
      }
    }
  },
  {
    "root": [
      "غ",
      "ذ",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%BA%D8%B0%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to feed / to nourish",
        "masdar": "غَذْو",
        "trans": true,
        "en": {
          "past": "fed",
          "pp": "fed",
          "pres3": "feeds",
          "ing": "feeding"
        }
      },
      "II": {
        "gloss": "to nourish / to nurture / to feed",
        "masdar": "تَغْذِيَة",
        "trans": true,
        "en": {
          "past": "nourished",
          "pp": "nourished",
          "pres3": "nourishes",
          "ing": "nourishing"
        }
      },
      "V": {
        "gloss": "to be nourished / to feed on / to eat",
        "masdar": "تَغَذٍّ",
        "trans": false,
        "en": {
          "past": "fed on",
          "pres3": "feeds on",
          "ing": "feeding on"
        }
      },
      "VIII": {
        "gloss": "to be nourished / to subsist on",
        "masdar": "اِغْتِذَاء",
        "trans": false,
        "en": {
          "past": "subsisted on",
          "pres3": "subsists on",
          "ing": "subsisting on"
        }
      }
    }
  },
  {
    "root": [
      "أ",
      "د",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D8%AF%D9%91%D9%89.html",
    "note": "Also mahmūz al-fāʾ, so the hamza carries its own spelling rules.",
    "forms": {
      "II": {
        "gloss": "to carry out / to perform / to pay",
        "masdar": "تَأْدِيَة",
        "trans": true,
        "en": {
          "past": "carried out",
          "pp": "carried out",
          "pres3": "carries out",
          "ing": "carrying out"
        }
      },
      "V": {
        "gloss": "to lead to / to result in",
        "masdar": "تَأَدٍّ",
        "trans": false,
        "en": {
          "past": "led to",
          "pres3": "leads to",
          "ing": "leading to"
        }
      }
    }
  },
  {
    "root": [
      "ح",
      "ل",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AD%D9%84%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to be sweet / to be pleasant",
        "masdar": "حَلَاوَة",
        "trans": false,
        "en": {
          "past": "was sweet",
          "pres3": "is sweet",
          "ing": "being sweet"
        }
      },
      "II": {
        "gloss": "to sweeten / to adorn / to decorate",
        "masdar": "تَحْلِيَة",
        "trans": true,
        "en": {
          "past": "sweetened",
          "pp": "sweetened",
          "pres3": "sweetens",
          "ing": "sweetening"
        }
      },
      "IV": {
        "gloss": "to sweeten / to make pleasant",
        "masdar": "إِحْلَاء",
        "trans": true,
        "en": {
          "past": "sweetened",
          "pp": "sweetened",
          "pres3": "sweetens",
          "ing": "sweetening"
        }
      },
      "V": {
        "gloss": "to be adorned with / to be endowed with",
        "masdar": "تَحَلٍّ",
        "trans": false,
        "en": {
          "past": "was adorned with",
          "pres3": "is adorned with",
          "ing": "being adorned with"
        }
      },
      "X": {
        "gloss": "to find sweet / to relish",
        "masdar": "اِسْتِحْلَاء",
        "trans": true,
        "en": {
          "past": "relished",
          "pp": "relished",
          "pres3": "relishes",
          "ing": "relishing"
        }
      }
    }
  },
  {
    "root": [
      "غ",
      "ط",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%BA%D8%B7%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to cover / to overspread",
        "masdar": "غَطْو",
        "trans": true,
        "en": {
          "past": "covered",
          "pp": "covered",
          "pres3": "covers",
          "ing": "covering"
        }
      },
      "II": {
        "gloss": "to cover / to conceal / to cover (costs, a story)",
        "masdar": "تَغْطِيَة",
        "trans": true,
        "en": {
          "past": "covered",
          "pp": "covered",
          "pres3": "covers",
          "ing": "covering"
        }
      },
      "V": {
        "gloss": "to be covered / to cover oneself",
        "masdar": "تَغَطٍّ",
        "trans": false,
        "en": {
          "past": "covered up",
          "pres3": "covers up",
          "ing": "covering up"
        }
      }
    }
  },
  {
    "root": [
      "خ",
      "ل",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AE%D9%84%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to be empty / to be free of",
        "masdar": "خُلُوّ",
        "trans": false,
        "en": {
          "past": "was empty",
          "pres3": "is empty",
          "ing": "being empty"
        }
      },
      "II": {
        "gloss": "to leave / to let be / to vacate",
        "masdar": "تَخْلِيَة",
        "trans": true,
        "en": {
          "past": "left alone",
          "pp": "left alone",
          "pres3": "leaves alone",
          "ing": "leaving alone"
        }
      },
      "IV": {
        "gloss": "to empty / to evacuate / to release",
        "masdar": "إِخْلَاء",
        "trans": true,
        "en": {
          "past": "evacuated",
          "pp": "evacuated",
          "pres3": "evacuates",
          "ing": "evacuating"
        }
      },
      "V": {
        "gloss": "to give up / to renounce / to abandon",
        "masdar": "تَخَلٍّ",
        "trans": false,
        "en": {
          "past": "gave up",
          "pres3": "gives up",
          "ing": "giving up"
        }
      },
      "X": {
        "gloss": "to seek privacy / to be alone with",
        "masdar": "اِسْتِخْلَاء",
        "trans": false,
        "en": {
          "past": "withdrew in private",
          "pres3": "withdraws in private",
          "ing": "withdrawing in private"
        }
      }
    }
  },
  {
    "root": [
      "و",
      "ل",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%84%D9%91%D9%89.html",
    "note": "Lafīf mafrūq (mithāl wāw + nāqiṣ yāʾ); Form I drops the wāw: وَلِيَ / يَلِي.",
    "forms": {
      "I": {
        "bab": "ii",
        "gloss": "to follow / to be adjacent to / to be in charge of",
        "masdar": "وِلَايَة",
        "trans": true,
        "en": {
          "past": "followed",
          "pp": "followed",
          "pres3": "follows",
          "ing": "following"
        }
      },
      "II": {
        "gloss": "to turn away / to appoint / to put in charge",
        "masdar": "تَوْلِيَة",
        "trans": true,
        "en": {
          "past": "appointed",
          "pp": "appointed",
          "pres3": "appoints",
          "ing": "appointing"
        }
      },
      "III": {
        "gloss": "to befriend / to follow in succession",
        "masdar": "مُوَالَاة",
        "trans": true,
        "en": {
          "past": "allied with",
          "pp": "allied with",
          "pres3": "allies with",
          "ing": "allying with"
        }
      },
      "IV": {
        "gloss": "to grant / to accord / to give (attention)",
        "masdar": "إِيلَاء",
        "trans": true,
        "en": {
          "past": "accorded",
          "pp": "accorded",
          "pres3": "accords",
          "ing": "according"
        }
      },
      "V": {
        "gloss": "to take charge of / to assume / to turn away",
        "masdar": "تَوَلٍّ",
        "trans": true,
        "en": {
          "past": "took charge of",
          "pp": "taken charge of",
          "pres3": "takes charge of",
          "ing": "taking charge of"
        }
      },
      "VI": {
        "gloss": "to follow one another in succession",
        "masdar": "تَوَالٍ",
        "trans": false,
        "en": {
          "past": "followed in succession",
          "pres3": "follows in succession",
          "ing": "following in succession"
        }
      },
      "X": {
        "gloss": "to take possession of / to seize",
        "masdar": "اِسْتِيلَاء",
        "trans": false,
        "en": {
          "past": "seized control of",
          "pres3": "seizes control of",
          "ing": "seizing control of"
        }
      }
    }
  },
  {
    "root": [
      "غ",
      "ن",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%BA%D9%86%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to be rich / to do without",
        "masdar": "غِنًى",
        "trans": false,
        "en": {
          "past": "was rich",
          "pres3": "is rich",
          "ing": "being rich"
        }
      },
      "II": {
        "gloss": "to sing",
        "masdar": "تَغْنِيَة",
        "trans": true,
        "en": {
          "past": "sang",
          "pp": "sung",
          "pres3": "sings",
          "ing": "singing"
        }
      },
      "IV": {
        "gloss": "to enrich / to suffice / to avail",
        "masdar": "إِغْنَاء",
        "trans": true,
        "en": {
          "past": "enriched",
          "pp": "enriched",
          "pres3": "enriches",
          "ing": "enriching"
        }
      },
      "V": {
        "gloss": "to sing / to extol",
        "masdar": "تَغَنٍّ",
        "trans": false,
        "en": {
          "past": "sang of",
          "pres3": "sings of",
          "ing": "singing of"
        }
      },
      "VIII": {
        "gloss": "to become rich",
        "masdar": "اِغْتِنَاء",
        "trans": false,
        "en": {
          "past": "became rich",
          "pres3": "becomes rich",
          "ing": "becoming rich"
        }
      },
      "X": {
        "gloss": "to do without / to dispense with",
        "masdar": "اِسْتِغْنَاء",
        "trans": false,
        "en": {
          "past": "did without",
          "pres3": "does without",
          "ing": "doing without"
        }
      }
    }
  },
  {
    "root": [
      "س",
      "ل",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%84%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to forget / to be consoled",
        "masdar": "سُلُوّ",
        "trans": false,
        "en": {
          "past": "got over",
          "pres3": "gets over",
          "ing": "getting over"
        }
      },
      "II": {
        "gloss": "to comfort / to divert / to entertain",
        "masdar": "تَسْلِيَة",
        "trans": true,
        "en": {
          "past": "entertained",
          "pp": "entertained",
          "pres3": "entertains",
          "ing": "entertaining"
        }
      },
      "IV": {
        "gloss": "to console / to make forget",
        "masdar": "إِسْلَاء",
        "trans": true,
        "en": {
          "past": "consoled",
          "pp": "consoled",
          "pres3": "consoles",
          "ing": "consoling"
        }
      },
      "V": {
        "gloss": "to amuse oneself / to be entertained",
        "masdar": "تَسَلٍّ",
        "trans": false,
        "en": {
          "past": "was amused",
          "pres3": "is amused",
          "ing": "being amused"
        }
      }
    }
  },
  {
    "root": [
      "م",
      "ن",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%85%D9%86%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "ai",
        "gloss": "to destine / to afflict (with)",
        "masdar": "مَنْي",
        "trans": true,
        "en": {
          "past": "destined",
          "pp": "destined",
          "pres3": "destines",
          "ing": "destining"
        }
      },
      "II": {
        "gloss": "to raise the hopes of / to make (someone) wish",
        "masdar": "تَمْنِيَة",
        "trans": true,
        "en": {
          "past": "raised hopes of",
          "pp": "given hope",
          "pres3": "raises hopes of",
          "ing": "raising hopes of"
        }
      },
      "V": {
        "gloss": "to wish / to desire",
        "masdar": "تَمَنٍّ",
        "trans": true,
        "en": {
          "past": "wished",
          "pp": "wished for",
          "pres3": "wishes",
          "ing": "wishing"
        }
      }
    }
  },
  {
    "root": [
      "و",
      "ص",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D8%B5%D9%91%D9%89.html",
    "note": "Lafīf mafrūq (mithāl wāw + nāqiṣ yāʾ); Form I is archaic in MSA.",
    "forms": {
      "II": {
        "gloss": "to enjoin / to instruct / to bequeath to",
        "masdar": "تَوْصِيَة",
        "trans": true,
        "en": {
          "past": "instructed",
          "pp": "instructed",
          "pres3": "instructs",
          "ing": "instructing"
        }
      },
      "IV": {
        "gloss": "to enjoin / to recommend / to bequeath",
        "masdar": "إِيصَاء",
        "trans": true,
        "en": {
          "past": "bequeathed",
          "pp": "bequeathed",
          "pres3": "bequeaths",
          "ing": "bequeathing"
        }
      },
      "VI": {
        "gloss": "to enjoin one another",
        "masdar": "تَوَاصٍ",
        "trans": false,
        "en": {
          "past": "enjoined one another",
          "pres3": "enjoin one another",
          "ing": "enjoining one another"
        }
      },
      "X": {
        "gloss": "to ask for advice / to accept a recommendation",
        "masdar": "اِسْتِيصَاء",
        "trans": false,
        "en": {
          "past": "sought counsel",
          "pres3": "seeks counsel",
          "ing": "seeking counsel"
        }
      }
    }
  },
  {
    "root": [
      "ك",
      "ن",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%83%D9%86%D9%91%D9%89.html",
    "note": "Reverso uses كَنَّى as the model verb for this whole Form II nāqiṣ class.",
    "forms": {
      "I": {
        "bab": "ai",
        "gloss": "to allude to / to speak indirectly of",
        "masdar": "كِنَايَة",
        "trans": false,
        "en": {
          "past": "alluded to",
          "pres3": "alludes to",
          "ing": "alluding to"
        }
      },
      "II": {
        "gloss": "to give a kunya to / to nickname",
        "masdar": "تَكْنِيَة",
        "trans": true,
        "en": {
          "past": "nicknamed",
          "pp": "nicknamed",
          "pres3": "nicknames",
          "ing": "nicknaming"
        }
      },
      "V": {
        "gloss": "to be nicknamed / to take a kunya",
        "masdar": "تَكَنٍّ",
        "trans": false,
        "en": {
          "past": "was nicknamed",
          "pres3": "is nicknamed",
          "ing": "being nicknamed"
        }
      }
    }
  },
  {
    "root": [
      "و",
      "ر",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D8%B1%D9%91%D9%89.html",
    "note": "Lafīf mafrūq (mithāl wāw + nāqiṣ yāʾ).",
    "forms": {
      "II": {
        "gloss": "to conceal / to allude indirectly / to insinuate",
        "masdar": "تَوْرِيَة",
        "trans": true,
        "en": {
          "past": "concealed",
          "pp": "concealed",
          "pres3": "conceals",
          "ing": "concealing"
        }
      },
      "III": {
        "gloss": "to hide / to cover up",
        "masdar": "مُوَارَاة",
        "trans": true,
        "en": {
          "past": "hid",
          "pp": "hidden",
          "pres3": "hides",
          "ing": "hiding"
        }
      },
      "IV": {
        "gloss": "to kindle / to strike (fire)",
        "masdar": "إِيرَاء",
        "trans": true,
        "en": {
          "past": "kindled",
          "pp": "kindled",
          "pres3": "kindles",
          "ing": "kindling"
        }
      },
      "VI": {
        "gloss": "to hide oneself / to disappear from view",
        "masdar": "تَوَارٍ",
        "trans": false,
        "en": {
          "past": "disappeared",
          "pres3": "disappears",
          "ing": "disappearing"
        }
      }
    }
  },
  {
    "root": [
      "ع",
      "د",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B9%D8%AF%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to run / to pass by / to exceed",
        "masdar": "عَدْو",
        "trans": false,
        "en": {
          "past": "ran",
          "pres3": "runs",
          "ing": "running"
        }
      },
      "II": {
        "gloss": "to make pass / to take across / to transfer",
        "masdar": "تَعْدِيَة",
        "trans": true,
        "en": {
          "past": "took across",
          "pp": "taken across",
          "pres3": "takes across",
          "ing": "taking across"
        }
      },
      "III": {
        "gloss": "to be hostile to / to treat as an enemy",
        "masdar": "مُعَادَاة",
        "trans": true,
        "en": {
          "past": "opposed",
          "pp": "opposed",
          "pres3": "opposes",
          "ing": "opposing"
        }
      },
      "IV": {
        "gloss": "to infect / to contaminate",
        "masdar": "إِعْدَاء",
        "trans": true,
        "en": {
          "past": "infected",
          "pp": "infected",
          "pres3": "infects",
          "ing": "infecting"
        }
      },
      "V": {
        "gloss": "to exceed / to transgress / to encroach on",
        "masdar": "تَعَدٍّ",
        "trans": true,
        "en": {
          "past": "exceeded",
          "pp": "exceeded",
          "pres3": "exceeds",
          "ing": "exceeding"
        }
      },
      "VI": {
        "gloss": "to be mutually hostile",
        "masdar": "تَعَادٍ",
        "trans": false,
        "en": {
          "past": "were at odds",
          "pres3": "are at odds",
          "ing": "being at odds"
        }
      },
      "VIII": {
        "gloss": "to attack / to assault / to infringe on",
        "masdar": "اِعْتِدَاء",
        "trans": false,
        "en": {
          "past": "attacked",
          "pres3": "attacks",
          "ing": "attacking"
        }
      },
      "X": {
        "gloss": "to seek redress against / to incite against",
        "masdar": "اِسْتِعْدَاء",
        "trans": true,
        "en": {
          "past": "incited against",
          "pp": "incited against",
          "pres3": "incites against",
          "ing": "inciting against"
        }
      }
    }
  },
  {
    "root": [
      "ق",
      "ف",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%81%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to follow / to trail",
        "masdar": "قَفْو",
        "trans": true,
        "en": {
          "past": "trailed",
          "pp": "trailed",
          "pres3": "trails",
          "ing": "trailing"
        }
      },
      "II": {
        "gloss": "to make follow / to send after / to rhyme",
        "masdar": "تَقْفِيَة",
        "trans": true,
        "en": {
          "past": "sent after",
          "pp": "sent after",
          "pres3": "sends after",
          "ing": "sending after"
        }
      },
      "VIII": {
        "gloss": "to follow / to track / to trace",
        "masdar": "اِقْتِفَاء",
        "trans": true,
        "en": {
          "past": "tracked",
          "pp": "tracked",
          "pres3": "tracks",
          "ing": "tracking"
        }
      }
    }
  },
  {
    "root": [
      "ن",
      "ق",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D9%82%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to be clean / to be pure",
        "masdar": "نَقَاء",
        "trans": false,
        "en": {
          "past": "was clean",
          "pres3": "is clean",
          "ing": "being clean"
        }
      },
      "II": {
        "gloss": "to clean / to purify / to sift",
        "masdar": "تَنْقِيَة",
        "trans": true,
        "en": {
          "past": "purified",
          "pp": "purified",
          "pres3": "purifies",
          "ing": "purifying"
        }
      },
      "V": {
        "gloss": "to be cleaned / to be purified",
        "masdar": "تَنَقٍّ",
        "trans": false,
        "en": {
          "past": "was purified",
          "pres3": "is purified",
          "ing": "being purified"
        }
      },
      "VIII": {
        "gloss": "to select / to pick out",
        "masdar": "اِنْتِقَاء",
        "trans": true,
        "en": {
          "past": "selected",
          "pp": "selected",
          "pres3": "selects",
          "ing": "selecting"
        }
      }
    }
  },
  {
    "root": [
      "ن",
      "س",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D8%B3%D9%91%D9%89.html",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to forget",
        "masdar": "نِسْيَان",
        "trans": true,
        "en": {
          "past": "forgot",
          "pp": "forgotten",
          "pres3": "forgets",
          "ing": "forgetting"
        }
      },
      "II": {
        "gloss": "to make (someone) forget",
        "masdar": "تَنْسِيَة",
        "trans": true,
        "en": {
          "past": "made forget",
          "pp": "made to forget",
          "pres3": "makes forget",
          "ing": "making forget"
        }
      },
      "IV": {
        "gloss": "to make forget / to cause to forget",
        "masdar": "إِنْسَاء",
        "trans": true,
        "en": {
          "past": "made forget",
          "pp": "made to forget",
          "pres3": "makes forget",
          "ing": "making forget"
        }
      },
      "V": {
        "gloss": "to try to forget / to put out of mind",
        "masdar": "تَنَسٍّ",
        "trans": true,
        "en": {
          "past": "put out of mind",
          "pp": "put out of mind",
          "pres3": "puts out of mind",
          "ing": "putting out of mind"
        }
      },
      "VI": {
        "gloss": "to feign forgetfulness / to deliberately ignore",
        "masdar": "تَنَاسٍ",
        "trans": true,
        "en": {
          "past": "deliberately ignored",
          "pp": "deliberately ignored",
          "pres3": "deliberately ignores",
          "ing": "deliberately ignoring"
        }
      }
    }
  },
  {
    "root": [
      "ص",
      "ل",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B5%D9%8E%D9%84%D9%8E%D9%91%D9%89.html",
    "note": "Reverso only resolves this correctly when typed fully vocalized as صَلَّى. Form I of ص-ل-و is archaic; the homographic root ص-ل-ي means \"to roast, burn\".",
    "forms": {
      "II": {
        "gloss": "to pray / to perform the ṣalāh / to invoke blessing upon",
        "masdar": "صَلَاة",
        "trans": false,
        "en": {
          "past": "prayed",
          "pres3": "prays",
          "ing": "praying"
        }
      }
    }
  },
  {
    "root": [
      "و",
      "ف",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%81%D9%8E%D9%91%D9%89.html",
    "note": "Type this one fully vocalized as وَفَّى — bare وفّى returns the Form I paradigm. Lafīf mafrūq root.",
    "forms": {
      "I": {
        "bab": "ai",
        "gloss": "to be faithful / to keep (a promise)",
        "masdar": "وَفَاء",
        "trans": false,
        "en": {
          "past": "kept faith",
          "pres3": "keeps faith",
          "ing": "keeping faith"
        }
      },
      "II": {
        "gloss": "to fulfil in full / to pay in full",
        "masdar": "تَوْفِيَة",
        "trans": true,
        "en": {
          "past": "paid in full",
          "pp": "paid in full",
          "pres3": "pays in full",
          "ing": "paying in full"
        }
      },
      "III": {
        "gloss": "to arrive at / to come to / to supply",
        "masdar": "مُوَافَاة",
        "trans": true,
        "en": {
          "past": "supplied",
          "pp": "supplied",
          "pres3": "supplies",
          "ing": "supplying"
        }
      },
      "IV": {
        "gloss": "to fulfil / to pay in full / to be ample",
        "masdar": "إِيفَاء",
        "trans": true,
        "en": {
          "past": "fulfilled",
          "pp": "fulfilled",
          "pres3": "fulfils",
          "ing": "fulfilling"
        }
      },
      "V": {
        "gloss": "to take in full; (passive تُوُفِّيَ) to pass away",
        "masdar": "تَوَفٍّ",
        "trans": true,
        "en": {
          "past": "took in full",
          "pp": "taken in full",
          "pres3": "takes in full",
          "ing": "taking in full"
        }
      },
      "X": {
        "gloss": "to collect in full / to exhaust / to satisfy",
        "masdar": "اِسْتِيفَاء",
        "trans": true,
        "en": {
          "past": "collected in full",
          "pp": "collected in full",
          "pres3": "collects in full",
          "ing": "collecting in full"
        }
      }
    }
  },
  {
    "root": [
      "ن",
      "م",
      "و"
    ],
    "type": "naqis_waw",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D9%8E%D9%85%D9%8E%D9%91%D9%89.html",
    "note": "Type this one fully vocalized as نَمَّى — bare نمّى returns the Form I paradigm.",
    "forms": {
      "I": {
        "bab": "au",
        "gloss": "to grow / to increase",
        "masdar": "نُمُوّ",
        "trans": false,
        "en": {
          "past": "grew",
          "pres3": "grows",
          "ing": "growing"
        }
      },
      "II": {
        "gloss": "to develop / to cultivate / to make grow",
        "masdar": "تَنْمِيَة",
        "trans": true,
        "en": {
          "past": "developed",
          "pp": "developed",
          "pres3": "develops",
          "ing": "developing"
        }
      },
      "IV": {
        "gloss": "to make grow / to increase",
        "masdar": "إِنْمَاء",
        "trans": true,
        "en": {
          "past": "increased",
          "pp": "increased",
          "pres3": "increases",
          "ing": "increasing"
        }
      },
      "V": {
        "gloss": "to grow / to develop",
        "masdar": "تَنَمٍّ",
        "trans": false,
        "en": {
          "past": "developed",
          "pres3": "develops",
          "ing": "developing"
        }
      },
      "VIII": {
        "gloss": "to belong to / to be affiliated with",
        "masdar": "اِنْتِمَاء",
        "trans": false,
        "en": {
          "past": "belonged to",
          "pres3": "belongs to",
          "ing": "belonging to"
        }
      }
    }
  },
  {
    "root": [
      "ر",
      "ق",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B1%D9%8E%D9%82%D9%8E%D9%91%D9%89.html",
    "note": "Type this one fully vocalized as رَقَّى — bare رقّى returns the Form I paradigm.",
    "forms": {
      "I": {
        "bab": "ia",
        "gloss": "to ascend / to climb / to rise",
        "masdar": "رُقِيّ",
        "trans": false,
        "en": {
          "past": "ascended",
          "pres3": "ascends",
          "ing": "ascending"
        }
      },
      "II": {
        "gloss": "to promote / to advance / to elevate",
        "masdar": "تَرْقِيَة",
        "trans": true,
        "en": {
          "past": "promoted",
          "pp": "promoted",
          "pres3": "promotes",
          "ing": "promoting"
        }
      },
      "V": {
        "gloss": "to rise / to be promoted / to advance",
        "masdar": "تَرَقٍّ",
        "trans": false,
        "en": {
          "past": "was promoted",
          "pres3": "is promoted",
          "ing": "being promoted"
        }
      },
      "VIII": {
        "gloss": "to ascend / to rise to",
        "masdar": "اِرْتِقَاء",
        "trans": false,
        "en": {
          "past": "rose to",
          "pres3": "rises to",
          "ing": "rising to"
        }
      }
    }
  },
  {
    "root": [
      "غ",
      "ل",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%BA%D9%8E%D9%84%D9%8E%D9%91%D9%89.html",
    "note": "Type this one fully vocalized as غَلَّى — bare غلّى returns the Form I paradigm. Do not confuse with غ-ل-و \"to be excessive / expensive\".",
    "forms": {
      "I": {
        "bab": "ai",
        "gloss": "to boil / to come to a boil",
        "masdar": "غَلَيَان",
        "trans": false,
        "en": {
          "past": "boiled",
          "pres3": "boils",
          "ing": "boiling"
        }
      },
      "II": {
        "gloss": "to bring to a boil / to make boil",
        "masdar": "تَغْلِيَة",
        "trans": true,
        "en": {
          "past": "boiled",
          "pp": "boiled",
          "pres3": "boils",
          "ing": "boiling"
        }
      },
      "IV": {
        "gloss": "to bring to a boil",
        "masdar": "إِغْلَاء",
        "trans": true,
        "en": {
          "past": "brought to a boil",
          "pp": "brought to a boil",
          "pres3": "brings to a boil",
          "ing": "bringing to a boil"
        }
      }
    }
  },
  {
    "root": [
      "ث",
      "ن",
      "ي"
    ],
    "type": "naqis_ya",
    "reverso": "https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AB%D9%8E%D9%86%D9%8E%D9%91%D9%89.html",
    "note": "Type this one fully vocalized as ثَنَّى — bare ثنّى returns the Form I paradigm.",
    "forms": {
      "I": {
        "bab": "ai",
        "gloss": "to fold / to bend / to turn away",
        "masdar": "ثَنْي",
        "trans": true,
        "en": {
          "past": "folded",
          "pp": "folded",
          "pres3": "folds",
          "ing": "folding"
        }
      },
      "II": {
        "gloss": "to double / to do twice / to make dual",
        "masdar": "تَثْنِيَة",
        "trans": true,
        "en": {
          "past": "doubled",
          "pp": "doubled",
          "pres3": "doubles",
          "ing": "doubling"
        }
      },
      "IV": {
        "gloss": "to praise / to commend",
        "masdar": "ثَنَاء",
        "trans": false,
        "en": {
          "past": "praised",
          "pres3": "praises",
          "ing": "praising"
        }
      },
      "V": {
        "gloss": "to be doubled / to sway / to bend",
        "masdar": "تَثَنٍّ",
        "trans": false,
        "en": {
          "past": "swayed",
          "pres3": "sways",
          "ing": "swaying"
        }
      },
      "VII": {
        "gloss": "to be bent / to bend / to turn away",
        "masdar": "اِنْثِنَاء",
        "trans": false,
        "en": {
          "past": "bent",
          "pres3": "bends",
          "ing": "bending"
        }
      },
      "X": {
        "gloss": "to except / to exclude",
        "masdar": "اِسْتِثْنَاء",
        "trans": true,
        "en": {
          "past": "excluded",
          "pp": "excluded",
          "pres3": "excludes",
          "ing": "excluding"
        }
      }
    }
  }
]