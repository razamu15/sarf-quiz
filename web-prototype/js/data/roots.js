// Root lexicon. Sālim roots are fully engine-conjugated; irregular roots carry
// hand-authored tables (see قول at the bottom) that override the engine.
//
// forms.I.bab   → which of the six abwāb (1..6)
// forms.*.trans → transitive? (majhūl questions only make sense when true)
// forms.I.masdar is samāʿī (per-root); mazīd maṣādir come from templates.

export const ROOTS = [
  {
    root: ['ك', 'ت', 'ب'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to write', masdar: 'كِتَابَة', trans: true },
    },
  },
  {
    root: ['ن', 'ص', 'ر'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to help', masdar: 'نَصْر', trans: true },
    },
  },
  {
    root: ['خ', 'ر', 'ج'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to go out', masdar: 'خُرُوج', trans: false },
      IV: { gloss: 'to expel / bring out', trans: true },
      X: { gloss: 'to extract', trans: true },
    },
  },
  {
    root: ['ن', 'ظ', 'ر'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to look', masdar: 'نَظَر', trans: true },
      VIII: { gloss: 'to wait for', trans: true },
    },
  },
  {
    root: ['ق', 'ت', 'ل'], type: 'salim',
    forms: {
      I: { bab: 1, gloss: 'to kill', masdar: 'قَتْل', trans: true },
      III: { gloss: 'to fight', trans: true },
    },
  },
  {
    root: ['ض', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to hit', masdar: 'ضَرْب', trans: true },
    },
  },
  {
    root: ['ج', 'ل', 'س'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to sit', masdar: 'جُلُوس', trans: false },
    },
  },
  {
    root: ['ك', 'س', 'ر'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to break', masdar: 'كَسْر', trans: true },
      II: { gloss: 'to smash to pieces', trans: true },
      VII: { gloss: 'to get broken', trans: false },
    },
  },
  {
    root: ['غ', 'ف', 'ر'], type: 'salim',
    forms: {
      I: { bab: 2, gloss: 'to forgive', masdar: 'مَغْفِرَة', trans: true },
      X: { gloss: 'to seek forgiveness', trans: true },
    },
  },
  {
    root: ['ف', 'ت', 'ح'], type: 'salim',
    forms: {
      I: { bab: 3, gloss: 'to open', masdar: 'فَتْح', trans: true },
    },
  },
  {
    root: ['ج', 'م', 'ع'], type: 'salim',
    forms: {
      I: { bab: 3, gloss: 'to gather', masdar: 'جَمْع', trans: true },
      VIII: { gloss: 'to assemble / meet', trans: false },
    },
  },
  {
    root: ['ظ', 'ه', 'ر'], type: 'salim',
    forms: {
      I: { bab: 3, gloss: 'to appear', masdar: 'ظُهُور', trans: false },
      IV: { gloss: 'to reveal', trans: true },
      VI: { gloss: 'to pretend / demonstrate', trans: false },
    },
  },
  {
    root: ['س', 'م', 'ع'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to hear', masdar: 'سَمْع', trans: true },
      VIII: { gloss: 'to listen', trans: false },
    },
  },
  {
    root: ['ش', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to drink', masdar: 'شُرْب', trans: true },
    },
  },
  {
    root: ['ع', 'ل', 'م'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to know', masdar: 'عِلْم', trans: true },
      II: { gloss: 'to teach', trans: true },
      V: { gloss: 'to learn', trans: false },
      X: { gloss: 'to inquire', trans: true },
    },
  },
  {
    root: ['س', 'ل', 'م'], type: 'salim',
    forms: {
      I: { bab: 4, gloss: 'to be safe', masdar: 'سَلَامَة', trans: false },
      II: { gloss: 'to greet / hand over', trans: true },
      IV: { gloss: 'to submit (Islam)', trans: false },
      X: { gloss: 'to surrender', trans: false },
    },
  },
  {
    root: ['ك', 'ر', 'م'], type: 'salim',
    forms: {
      I: { bab: 5, gloss: 'to be noble', masdar: 'كَرَم', trans: false },
      IV: { gloss: 'to honor', trans: true },
    },
  },
  {
    root: ['ق', 'د', 'م'], type: 'salim',
    forms: {
      I: { bab: 5, gloss: 'to be old / ancient', masdar: 'قِدَم', trans: false },
      II: { gloss: 'to present / offer', trans: true },
      V: { gloss: 'to advance', trans: false },
    },
  },
  {
    root: ['ح', 'س', 'ب'], type: 'salim',
    forms: {
      I: { bab: 6, gloss: 'to deem / suppose', masdar: 'حُسْبَان', trans: true },
    },
  },
  {
    root: ['ش', 'ر', 'ك'], type: 'salim',
    forms: {
      III: { gloss: 'to partner with', trans: true },
      VIII: { gloss: 'to participate', trans: false },
    },
  },
  {
    root: ['ح', 'م', 'ر'], type: 'salim',
    forms: {
      IX: { gloss: 'to turn red', trans: false },
    },
  },
  {
    root: ['ص', 'ف', 'ر'], type: 'salim',
    forms: {
      IX: { gloss: 'to turn yellow', trans: false },
    },
  },

  // -------------------------------------------------------------------------
  // Hand-authored irregular sample: قول (ajwaf / hollow). Tables override the
  // engine; slots the tables don't cover simply aren't quizzed.
  // -------------------------------------------------------------------------
  {
    root: ['ق', 'و', 'ل'], type: 'ajwaf',
    forms: {
      I: {
        bab: 1, gloss: 'to say', masdar: 'قَوْل', trans: true,
        tables: {
          madi_malum: {
            '3ms': 'قَالَ', '3md': 'قَالَا', '3mp': 'قَالُوا',
            '3fs': 'قَالَتْ', '3fd': 'قَالَتَا', '3fp': 'قُلْنَ',
            '2ms': 'قُلْتَ', '2md': 'قُلْتُمَا', '2mp': 'قُلْتُمْ',
            '2fs': 'قُلْتِ', '2fd': 'قُلْتُمَا', '2fp': 'قُلْتُنَّ',
            '1s': 'قُلْتُ', '1p': 'قُلْنَا',
          },
          mudari_malum: {
            '3ms': 'يَقُولُ', '3md': 'يَقُولَانِ', '3mp': 'يَقُولُونَ',
            '3fs': 'تَقُولُ', '3fd': 'تَقُولَانِ', '3fp': 'يَقُلْنَ',
            '2ms': 'تَقُولُ', '2md': 'تَقُولَانِ', '2mp': 'تَقُولُونَ',
            '2fs': 'تَقُولِينَ', '2fd': 'تَقُولَانِ', '2fp': 'تَقُلْنَ',
            '1s': 'أَقُولُ', '1p': 'نَقُولُ',
          },
          amr_malum: {
            '2ms': 'قُلْ', '2md': 'قُولَا', '2mp': 'قُولُوا',
            '2fs': 'قُولِي', '2fd': 'قُولَا', '2fp': 'قُلْنَ',
          },
        },
      },
    },
  },
];
