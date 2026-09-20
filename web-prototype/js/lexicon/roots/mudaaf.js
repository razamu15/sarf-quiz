// Muḍāʿaf — the ʿayn and the lām are the same letter (مَدَّ, ظَلَّ). Engine-
// conjugated by MudaafConjugator, which merges the two into a shadda wherever
// the second is vowelled and unfolds them again where it is not (مَدَدْتُ).
//
// No fixture tables here: the hand-checked charts for these roots live in the
// parity suite, which is where they do their job now.
//
// Record shape, engine routing and the trans/bab/masdar conventions are
// documented once in the barrel, ../roots.js — read that first.

export const MUDAAF_ROOTS = [
  {
    root: ['م', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to stretch out / extend', masdar: 'مَدّ', trans: true,
           en: { past: 'stretched out', pp: 'stretched out', pres3: 'stretches out', ing: 'stretching out' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%85%D9%8E%D8%AF%D9%91%D9%8E.html' },
      IV: { gloss: 'to supply / reinforce', trans: true,
            en: { past: 'supplied', pp: 'supplied', pres3: 'supplies', ing: 'supplying' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%85%D9%8E%D8%AF%D9%91%D9%8E.html' },
      VIII: { gloss: 'to extend / stretch', trans: false,
              en: { past: 'extended', pres3: 'extends', ing: 'extending' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D9%85%D9%92%D8%AA%D9%8E%D8%AF%D9%91%D9%8E.html' },
      X: { gloss: 'to seek help / draw from', trans: true,
           en: { past: 'drew on', pp: 'drawn on', pres3: 'draws on', ing: 'drawing on' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%85%D9%8E%D8%AF%D9%91%D9%8E.html' },
    },
  },
  {
    root: ['ر', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to return / send back', masdar: 'رَدّ', trans: true,
           en: { past: 'returned', pp: 'returned', pres3: 'returns', ing: 'returning' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B1%D9%8E%D8%AF%D9%91%D9%8E.html' },
      V: { gloss: 'to hesitate / frequent', trans: false,
           en: { past: 'hesitated', pres3: 'hesitates', ing: 'hesitating' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%B1%D9%8E%D8%AF%D9%91%D9%8E%D8%AF%D9%8E.html' },
      VIII: { gloss: 'to turn back', trans: false,
              en: { past: 'turned back', pres3: 'turns back', ing: 'turning back' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B1%D9%92%D8%AA%D9%8E%D8%AF%D9%91%D9%8E.html' },
      X: { gloss: 'to reclaim / get back', trans: true,
           en: { past: 'reclaimed', pp: 'reclaimed', pres3: 'reclaims', ing: 'reclaiming' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D8%B1%D9%8E%D8%AF%D9%91%D9%8E.html' },
    },
  },
  {
    root: ['ح', 'ب', 'ب'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to love', masdar: 'حُبّ', trans: true,
           en: { past: 'loved', pp: 'loved', pres3: 'loves', ing: 'loving' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AD%D9%8E%D8%A8%D9%91%D9%8E.html' },
      IV: { gloss: 'to love', trans: true,
            en: { past: 'loved', pp: 'loved', pres3: 'loves', ing: 'loving' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D8%AD%D9%8E%D8%A8%D9%91%D9%8E.html' },
      V: { gloss: 'to endear oneself', trans: false,
           en: { past: 'endeared himself', pres3: 'endears himself', ing: 'endearing himself' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%AD%D9%8E%D8%A8%D9%91%D9%8E%D8%A8%D9%8E.html' },
      VI: { gloss: 'to love one another', trans: true,
            en: { past: 'loved one another', pres3: 'love one another', ing: 'loving one another' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%AD%D9%8E%D8%A7%D8%A8%D9%91%D9%8E.html' },
      X: { gloss: 'to consider desirable', trans: true,
           en: { past: 'considered desirable', pp: 'considered desirable', pres3: 'considers desirable', ing: 'considering desirable' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D8%AD%D9%8E%D8%A8%D9%91%D9%8E.html' },
    },
  },
  {
    root: ['ظ', 'ل', 'ل'], type: 'mudaaf',
    forms: {
      // bāb ai — the muḍāriʿ keeps the ʿayn's kasra: يَظِلُّ، and the
      // unfolded past shows the fatḥa the merge hid: ظَلَلْتُ
      I: { bab: 'ai', gloss: 'to remain / keep doing', masdar: 'ظُلُول', trans: false,
           en: { past: 'remained', pres3: 'remains', ing: 'remaining' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B8%D9%8E%D9%84%D9%91%D9%8E.html' },
      II: { gloss: 'to shade / overshadow', trans: true,
            en: { past: 'shaded', pp: 'shaded', pres3: 'shades', ing: 'shading' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B8%D9%8E%D9%84%D9%91%D9%8E%D9%84%D9%8E.html' },
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
           en: { past: 'passed by', pres3: 'passes by', ing: 'passing by' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%85%D9%8E%D8%B1%D9%91%D9%8E.html' },
      II: { gloss: 'to let pass / pass through', trans: true,
            en: { past: 'passed through', pp: 'passed through', pres3: 'passes through', ing: 'passing through' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%85%D9%8E%D8%B1%D9%91%D9%8E%D8%B1%D9%8E.html' },
      IV: { gloss: 'to make bitter', trans: true,
            en: { past: 'embittered', pp: 'embittered', pres3: 'embitters', ing: 'embittering' } },
      X: { gloss: 'to continue / persist', trans: false,
           en: { past: 'continued', pres3: 'continues', ing: 'continuing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%85%D9%8E%D8%B1%D9%91%D9%8E.html' },
    },
  },
  {
    root: ['ع', 'ف', 'ف'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to be chaste', masdar: 'عِفَّة', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B9%D9%8E%D9%81%D9%91%D9%8E.html' },
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
           en: { past: 'cut', pp: 'cut', pres3: 'cuts', ing: 'cutting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%AF%D9%91%D9%8E.html' },
      VII: { gloss: 'to be split apart', trans: false,
             en: { past: 'was split apart', pres3: 'gets split apart', ing: 'getting split apart' } },
    },
  },
  {
    root: ['م', 'س', 'س'], type: 'mudaaf',
    forms: {
      I: { bab: 'aa', gloss: 'to touch', masdar: 'مَسّ', trans: true,
           en: { past: 'touched', pp: 'touched', pres3: 'touches', ing: 'touching' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%85%D9%8E%D8%B3%D9%91%D9%8E.html' },
      III: { gloss: 'to be in contact with', trans: true,
             en: { past: 'adjoined', pp: 'adjoined', pres3: 'adjoins', ing: 'adjoining' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%85%D9%8E%D8%A7%D8%B3%D9%91%D9%8E.html' },
      VI: { gloss: 'to touch each other', trans: false,
            en: { past: 'touched each other', pres3: 'touch each other', ing: 'touching each other' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%85%D9%8E%D8%A7%D8%B3%D9%91%D9%8E.html' },
    },
  },
  {
    root: ['ض', 'ل', 'ل'], type: 'mudaaf',
    forms: {
      // ضَلَّ يَضِلُّ, bab ضَرَبَ. The doublet ضَلَّ يَضَلُّ (Ḥijāzī) is also
      // classical; the kasra form is the one the Qurʾān reads (لَا يَضِلُّ
      // رَبِّي), and a root entry holds one Form I.
      I: { bab: 'ai', gloss: 'to go astray', masdar: 'ضَلَال', trans: false,
           en: { past: 'went astray', pres3: 'goes astray', ing: 'going astray' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B6%D9%8E%D9%84%D9%91%D9%8E.html' },
      II: { gloss: 'to declare misguided', trans: true,
            en: { past: 'declared misguided', pp: 'declared misguided', pres3: 'declares misguided', ing: 'declaring misguided' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B6%D9%8E%D9%84%D9%91%D9%8E%D9%84%D9%8E.html' },
      IV: { gloss: 'to lead astray', trans: true,
            en: { past: 'led astray', pp: 'led astray', pres3: 'leads astray', ing: 'leading astray' } },
    },
  },
];
