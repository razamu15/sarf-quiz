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
      II: { gloss: 'to extend / to prolong', trans: true,
            en: { past: 'extended', pp: 'extended', pres3: 'extends', ing: 'extending' } },
      IV: { gloss: 'to supply / reinforce', trans: true,
            en: { past: 'supplied', pp: 'supplied', pres3: 'supplies', ing: 'supplying' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%85%D9%8E%D8%AF%D9%91%D9%8E.html' },
      V: { gloss: 'to stretch out', trans: false,
           en: { past: 'stretched out', pres3: 'stretches out', ing: 'stretching out' } },
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
      II: { gloss: 'to repeat', trans: true,
            en: { past: 'repeated', pp: 'repeated', pres3: 'repeats', ing: 'repeating' } },
      III: { gloss: 'to give back / to requite', trans: true,
             en: { past: 'gave back', pp: 'given back', pres3: 'gives back', ing: 'giving back' } },
      V: { gloss: 'to hesitate / frequent', trans: false,
           en: { past: 'hesitated', pres3: 'hesitates', ing: 'hesitating' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%B1%D9%8E%D8%AF%D9%91%D9%8E%D8%AF%D9%8E.html' },
      VI: { gloss: 'to go back and forth', trans: false,
            en: { past: 'went back and forth', pres3: 'goes back and forth', ing: 'going back and forth' } },
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
      II: { gloss: 'to endear / to make beloved', trans: true,
            en: { past: 'endeared', pp: 'endeared', pres3: 'endears', ing: 'endearing' } },
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
      X: { gloss: 'to continue / persist', trans: true,
           en: { past: 'continued', pp: 'continued', pres3: 'continues', ing: 'continuing' },
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
  {
    root: ['ش', 'ك', 'ك'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to doubt', masdar: 'شَكّ', trans: false,
           en: { past: 'doubted', pres3: 'doubts', ing: 'doubting' } },
      II: { gloss: 'to cast doubt on', trans: true,
            en: { past: 'cast doubt on', pp: 'cast doubt on', pres3: 'casts doubt on', ing: 'casting doubt on' } },
      V: { gloss: 'to become doubtful', trans: false,
           en: { past: 'became doubtful', pres3: 'becomes doubtful', ing: 'becoming doubtful' } },
    },
  },
  {
    root: ['ح', 'ج', 'ج'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to make pilgrimage', masdar: 'حَجّ', trans: false,
           en: { past: 'made pilgrimage', pres3: 'makes pilgrimage', ing: 'making pilgrimage' } },
      III: { gloss: 'to dispute with', trans: true,
             en: { past: 'disputed with', pp: 'disputed with', pres3: 'disputes with', ing: 'disputing with' } },
      VIII: { gloss: 'to protest / to object', trans: false,
              en: { past: 'protested', pres3: 'protests', ing: 'protesting' } },
    },
  },
  {
    root: ['س', 'ر', 'ر'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to please / to delight', masdar: 'سُرُور', trans: true,
           en: { past: 'pleased', pp: 'pleased', pres3: 'pleases', ing: 'pleasing' } },
      IV: { gloss: 'to confide / to keep secret', trans: true,
            en: { past: 'confided', pp: 'confided', pres3: 'confides', ing: 'confiding' } },
      X: { gloss: 'to be concealed', trans: false },
    },
  },
  {
    root: ['ظ', 'ن', 'ن'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to think / to suppose', masdar: 'ظَنّ', trans: true,
           en: { past: 'supposed', pp: 'supposed', pres3: 'supposes', ing: 'supposing' } },
    },
  },
  {
    root: ['ع', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to count', masdar: 'عَدّ', trans: true,
           en: { past: 'counted', pp: 'counted', pres3: 'counts', ing: 'counting' } },
      II: { gloss: 'to enumerate', trans: true,
            en: { past: 'enumerated', pp: 'enumerated', pres3: 'enumerates', ing: 'enumerating' } },
      IV: { gloss: 'to prepare', trans: true,
            en: { past: 'prepared', pp: 'prepared', pres3: 'prepares', ing: 'preparing' } },
      V: { gloss: 'to be numerous', trans: false },
      X: { gloss: 'to get ready', trans: false,
           en: { past: 'got ready', pres3: 'gets ready', ing: 'getting ready' } },
    },
  },
  {
    root: ['ش', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to pull tight / to tighten', masdar: 'شَدّ', trans: true,
           en: { past: 'tightened', pp: 'tightened', pres3: 'tightens', ing: 'tightening' } },
      II: { gloss: 'to intensify / to stress', trans: true,
            en: { past: 'intensified', pp: 'intensified', pres3: 'intensifies', ing: 'intensifying' } },
      VIII: { gloss: 'to grow severe', trans: false,
              en: { past: 'grew severe', pres3: 'grows severe', ing: 'growing severe' } },
    },
  },
  {
    root: ['ح', 'ل', 'ل'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to untie / to solve', masdar: 'حَلّ', trans: true,
           en: { past: 'solved', pp: 'solved', pres3: 'solves', ing: 'solving' } },
      II: { gloss: 'to analyse', trans: true,
            en: { past: 'analysed', pp: 'analysed', pres3: 'analyses', ing: 'analysing' } },
      IV: { gloss: 'to make lawful', trans: true,
            en: { past: 'made lawful', pp: 'made lawful', pres3: 'makes lawful', ing: 'making lawful' } },
      V: { gloss: 'to disintegrate', trans: false,
           en: { past: 'disintegrated', pres3: 'disintegrates', ing: 'disintegrating' } },
      X: { gloss: 'to deem lawful', trans: true,
           en: { past: 'deemed lawful', pp: 'deemed lawful', pres3: 'deems lawful', ing: 'deeming lawful' } },
    },
  },
  {
    root: ['ت', 'م', 'م'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to be complete', masdar: 'تَمَام', trans: false },
      II: { gloss: 'to complete', trans: true,
            en: { past: 'completed', pp: 'completed', pres3: 'completes', ing: 'completing' } },
      IV: { gloss: 'to finish / to bring to completion', trans: true,
            en: { past: 'finished', pp: 'finished', pres3: 'finishes', ing: 'finishing' } },
    },
  },
  {
    root: ['ص', 'ح', 'ح'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to be sound / correct', masdar: 'صِحَّة', trans: false },
      II: { gloss: 'to correct', trans: true,
            en: { past: 'corrected', pp: 'corrected', pres3: 'corrects', ing: 'correcting' } },
    },
  },
  {
    root: ['خ', 'ص', 'ص'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to single out', masdar: 'خُصُوص', trans: true,
           en: { past: 'singled out', pp: 'singled out', pres3: 'singles out', ing: 'singling out' } },
      II: { gloss: 'to allocate / to assign', trans: true,
            en: { past: 'allocated', pp: 'allocated', pres3: 'allocates', ing: 'allocating' } },
      V: { gloss: 'to specialise', trans: false,
           en: { past: 'specialised', pres3: 'specialises', ing: 'specialising' } },
      VIII: { gloss: 'to be peculiar to', trans: false },
    },
  },
  {
    root: ['ف', 'ر', 'ر'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to flee', masdar: 'فِرَار', trans: false,
           en: { past: 'fled', pres3: 'flees', ing: 'fleeing' } },
      IV: { gloss: 'to put to flight', trans: true,
            en: { past: 'put to flight', pp: 'put to flight', pres3: 'puts to flight', ing: 'putting to flight' } },
    },
  },
  {
    root: ['ح', 'ق', 'ق'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to be true / established', masdar: 'حَقّ', trans: false },
      II: { gloss: 'to verify / to achieve', trans: true,
            en: { past: 'verified', pp: 'verified', pres3: 'verifies', ing: 'verifying' } },
      V: { gloss: 'to be verified', trans: false },
      X: { gloss: 'to deserve / to be entitled to', trans: true,
           en: { past: 'deserved', pp: 'deserved', pres3: 'deserves', ing: 'deserving' } },
    },
  },
  {
    root: ['ج', 'د', 'د'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to be serious / diligent', masdar: 'جِدّ', trans: false },
      II: { gloss: 'to renew', trans: true,
            en: { past: 'renewed', pp: 'renewed', pres3: 'renews', ing: 'renewing' } },
      V: { gloss: 'to be renewed', trans: false },
      X: { gloss: 'to arise anew', trans: false,
           en: { past: 'arose anew', pres3: 'arises anew', ing: 'arising anew' } },
    },
  },
  {
    root: ['ح', 'س', 'س'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to sense / to feel', masdar: 'حِسّ', trans: true,
           en: { past: 'sensed', pp: 'sensed', pres3: 'senses', ing: 'sensing' } },
      IV: { gloss: 'to perceive / to feel', trans: true,
            en: { past: 'perceived', pp: 'perceived', pres3: 'perceives', ing: 'perceiving' } },
      V: { gloss: 'to feel around for', trans: true,
           en: { past: 'felt around for', pp: 'felt around for', pres3: 'feels around for', ing: 'feeling around for' } },
    },
  },
  {
    root: ['ع', 'ز', 'ز'], type: 'mudaaf',
    forms: {
      I: { bab: 'ai', gloss: 'to be mighty / dear', masdar: 'عِزّ', trans: false },
      II: { gloss: 'to strengthen / to reinforce', trans: true,
            en: { past: 'strengthened', pp: 'strengthened', pres3: 'strengthens', ing: 'strengthening' } },
      IV: { gloss: 'to honour / to hold dear', trans: true,
            en: { past: 'honoured', pp: 'honoured', pres3: 'honours', ing: 'honouring' } },
      X: { gloss: 'to grow strong', trans: false,
           en: { past: 'grew strong', pres3: 'grows strong', ing: 'growing strong' } },
    },
  },
  {
    root: ['ه', 'م', 'م'], type: 'mudaaf',
    forms: {
      I: { bab: 'au', gloss: 'to concern / to worry', masdar: 'هَمّ', trans: true,
           en: { past: 'concerned', pp: 'concerned', pres3: 'concerns', ing: 'concerning' } },
      IV: { gloss: 'to matter to / to concern', trans: true,
            en: { past: 'mattered to', pp: 'mattered to', pres3: 'matters to', ing: 'mattering to' } },
      VIII: { gloss: 'to take an interest / to care', trans: false,
              en: { past: 'took an interest', pres3: 'takes an interest', ing: 'taking an interest' } },
    },
  },
];
