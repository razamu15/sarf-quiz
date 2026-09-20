// Sālim — no weak letter, no hamza, no doubled radical. The default type and
// the one every engine rule is stated against: SalimConjugator authors these
// straight from the templates, with no iʿlāl to apply.
//
// Record shape, engine routing and the trans/bab/masdar conventions are
// documented once in the barrel, ../roots.js — read that first.

export const SALIM_ROOTS = [
  {
    root: ['ك', 'ت', 'ب'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to write', masdar: 'كِتَابَة', trans: true,
           en: { past: 'wrote', pp: 'written', pres3: 'writes', ing: 'writing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%83%D9%8E%D8%AA%D9%8E%D8%A8%D9%8E.html' },
    },
  },
  {
    root: ['ن', 'ص', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to help', masdar: 'نَصْر', trans: true,
           en: { past: 'helped', pp: 'helped', pres3: 'helps', ing: 'helping' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D9%8E%D8%B5%D9%8E%D8%B1%D9%8E.html' },
    },
  },
  {
    root: ['خ', 'ر', 'ج'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to go out', masdar: 'خُرُوج', trans: false,
           en: { past: 'went out', pres3: 'goes out', ing: 'going out' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AE%D9%8E%D8%B1%D9%8E%D8%AC%D9%8E.html' },
      IV: { gloss: 'to expel / bring out', trans: true,
            en: { past: 'expelled', pp: 'expelled', pres3: 'expels', ing: 'expelling' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D8%AE%D9%92%D8%B1%D9%8E%D8%AC%D9%8E.html' },
      X: { gloss: 'to extract', trans: true,
           en: { past: 'extracted', pp: 'extracted', pres3: 'extracts', ing: 'extracting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D8%AE%D9%92%D8%B1%D9%8E%D8%AC%D9%8E.html' },
    },
  },
  {
    root: ['ن', 'ظ', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to look', masdar: 'نَظَر', trans: true,
           en: { past: 'looked', pp: 'looked at', pres3: 'looks', ing: 'looking' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%86%D9%8E%D8%B8%D9%8E%D8%B1%D9%8E.html' },
      VIII: { gloss: 'to wait for', trans: true,
              en: { past: 'waited for', pp: 'waited for', pres3: 'waits for', ing: 'waiting for' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D9%86%D9%92%D8%AA%D9%8E%D8%B8%D9%8E%D8%B1%D9%8E.html' },
    },
  },
  {
    root: ['ق', 'ت', 'ل'], type: 'salim',
    forms: {
      I: { bab: 'au', gloss: 'to kill', masdar: 'قَتْل', trans: true,
           en: { past: 'killed', pp: 'killed', pres3: 'kills', ing: 'killing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%AA%D9%8E%D9%84%D9%8E.html' },
      III: { gloss: 'to fight', trans: true,
             en: { past: 'fought', pp: 'fought', pres3: 'fights', ing: 'fighting' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%A7%D8%AA%D9%8E%D9%84%D9%8E.html' },
    },
  },
  {
    root: ['ض', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 'ai', gloss: 'to hit', masdar: 'ضَرْب', trans: true,
           en: { past: 'hit', pp: 'hit', pres3: 'hits', ing: 'hitting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B6%D9%8E%D8%B1%D9%8E%D8%A8%D9%8E.html' },
    },
  },
  {
    root: ['ج', 'ل', 'س'], type: 'salim',
    forms: {
      I: { bab: 'ai', gloss: 'to sit', masdar: 'جُلُوس', trans: false,
           en: { past: 'sat', pres3: 'sits', ing: 'sitting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AC%D9%8E%D9%84%D9%8E%D8%B3%D9%8E.html' },
    },
  },
  {
    root: ['ك', 'س', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'ai', gloss: 'to break', masdar: 'كَسْر', trans: true,
           en: { past: 'broke', pp: 'broken', pres3: 'breaks', ing: 'breaking' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%83%D9%8E%D8%B3%D9%8E%D8%B1%D9%8E.html' },
      II: { gloss: 'to smash to pieces', trans: true,
            en: { past: 'smashed', pp: 'smashed', pres3: 'smashes', ing: 'smashing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%83%D9%8E%D8%B3%D9%91%D9%8E%D8%B1%D9%8E.html' },
      VII: { gloss: 'to get broken', trans: false,
             en: { past: 'got broken', pres3: 'gets broken', ing: 'getting broken' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D9%86%D9%92%D9%83%D9%8E%D8%B3%D9%8E%D8%B1%D9%8E.html' },
    },
  },
  {
    root: ['غ', 'ف', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'ai', gloss: 'to forgive', masdar: 'مَغْفِرَة', trans: true,
           en: { past: 'forgave', pp: 'forgiven', pres3: 'forgives', ing: 'forgiving' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%BA%D9%8E%D9%81%D9%8E%D8%B1%D9%8E.html' },
      X: { gloss: 'to seek forgiveness', trans: true,
           en: { past: 'sought forgiveness', pp: 'asked for forgiveness', pres3: 'seeks forgiveness', ing: 'seeking forgiveness' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D8%BA%D9%92%D9%81%D9%8E%D8%B1%D9%8E.html' },
    },
  },
  {
    root: ['ف', 'ت', 'ح'], type: 'salim',
    forms: {
      I: { bab: 'aa', gloss: 'to open', masdar: 'فَتْح', trans: true,
           en: { past: 'opened', pp: 'opened', pres3: 'opens', ing: 'opening' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%81%D9%8E%D8%AA%D9%8E%D8%AD%D9%8E.html' },
    },
  },
  {
    root: ['ج', 'م', 'ع'], type: 'salim',
    forms: {
      I: { bab: 'aa', gloss: 'to gather', masdar: 'جَمْع', trans: true,
           en: { past: 'gathered', pp: 'gathered', pres3: 'gathers', ing: 'gathering' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AC%D9%8E%D9%85%D9%8E%D8%B9%D9%8E.html' },
      VIII: { gloss: 'to assemble / meet', trans: false,
              en: { past: 'assembled', pres3: 'assembles', ing: 'assembling' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%AC%D9%92%D8%AA%D9%8E%D9%85%D9%8E%D8%B9%D9%8E.html' },
    },
  },
  {
    root: ['ظ', 'ه', 'ر'], type: 'salim',
    forms: {
      I: { bab: 'aa', gloss: 'to appear', masdar: 'ظُهُور', trans: false,
           en: { past: 'appeared', pres3: 'appears', ing: 'appearing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B8%D9%8E%D9%87%D9%8E%D8%B1%D9%8E.html' },
      IV: { gloss: 'to reveal', trans: true,
            en: { past: 'revealed', pp: 'revealed', pres3: 'reveals', ing: 'revealing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D8%B8%D9%92%D9%87%D9%8E%D8%B1%D9%8E.html' },
      VI: { gloss: 'to pretend / demonstrate', trans: false,
            en: { past: 'pretended', pres3: 'pretends', ing: 'pretending' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%B8%D9%8E%D8%A7%D9%87%D9%8E%D8%B1%D9%8E.html' },
    },
  },
  {
    root: ['س', 'م', 'ع'], type: 'salim',
    forms: {
      I: { bab: 'ia', gloss: 'to hear', masdar: 'سَمْع', trans: true,
           en: { past: 'heard', pp: 'heard', pres3: 'hears', ing: 'hearing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%8E%D9%85%D9%90%D8%B9%D9%8E.html' },
      VIII: { gloss: 'to listen', trans: false,
              en: { past: 'listened', pres3: 'listens', ing: 'listening' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%85%D9%8E%D8%B9%D9%8E.html' },
    },
  },
  {
    root: ['ش', 'ر', 'ب'], type: 'salim',
    forms: {
      I: { bab: 'ia', gloss: 'to drink', masdar: 'شُرْب', trans: true,
           en: { past: 'drank', pp: 'drunk', pres3: 'drinks', ing: 'drinking' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B4%D9%8E%D8%B1%D9%90%D8%A8%D9%8E.html' },
    },
  },
  {
    root: ['ع', 'ل', 'م'], type: 'salim',
    forms: {
      I: { bab: 'ia', gloss: 'to know', masdar: 'عِلْم', trans: true,
           en: { past: 'knew', pp: 'known', pres3: 'knows', ing: 'knowing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B9%D9%8E%D9%84%D9%90%D9%85%D9%8E.html' },
      II: { gloss: 'to teach', trans: true,
            en: { past: 'taught', pp: 'taught', pres3: 'teaches', ing: 'teaching' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B9%D9%8E%D9%84%D9%91%D9%8E%D9%85%D9%8E.html' },
      V: { gloss: 'to learn', trans: false,
           en: { past: 'learned', pres3: 'learns', ing: 'learning' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%B9%D9%8E%D9%84%D9%91%D9%8E%D9%85%D9%8E.html' },
      X: { gloss: 'to inquire', trans: true,
           en: { past: 'inquired', pp: 'inquired about', pres3: 'inquires', ing: 'inquiring' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D8%B9%D9%92%D9%84%D9%8E%D9%85%D9%8E.html' },
    },
  },
  {
    root: ['س', 'ل', 'م'], type: 'salim',
    forms: {
      I: { bab: 'ia', gloss: 'to be safe', masdar: 'سَلَامَة', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%8E%D9%84%D9%90%D9%85%D9%8E.html' },
      II: { gloss: 'to greet / hand over', trans: true,
            en: { past: 'greeted', pp: 'greeted', pres3: 'greets', ing: 'greeting' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%8E%D9%84%D9%91%D9%8E%D9%85%D9%8E.html' },
      IV: { gloss: 'to submit (Islam)', trans: false,
            en: { past: 'submitted', pres3: 'submits', ing: 'submitting' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D8%B3%D9%92%D9%84%D9%8E%D9%85%D9%8E.html' },
      X: { gloss: 'to surrender', trans: false,
           en: { past: 'surrendered', pres3: 'surrenders', ing: 'surrendering' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D8%B3%D9%92%D9%84%D9%8E%D9%85%D9%8E.html' },
    },
  },
  {
    root: ['ك', 'ر', 'م'], type: 'salim',
    forms: {
      I: { bab: 'uu', gloss: 'to be noble', masdar: 'كَرَم', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%83%D9%8E%D8%B1%D9%8F%D9%85%D9%8E.html' },
      IV: { gloss: 'to honor', trans: true,
            en: { past: 'honored', pp: 'honored', pres3: 'honors', ing: 'honoring' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%83%D9%92%D8%B1%D9%8E%D9%85%D9%8E.html' },
    },
  },
  {
    root: ['ق', 'د', 'م'], type: 'salim',
    forms: {
      I: { bab: 'uu', gloss: 'to be old / ancient', masdar: 'قِدَم', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%AF%D9%8F%D9%85%D9%8E.html' },
      II: { gloss: 'to present / offer', trans: true,
            en: { past: 'presented', pp: 'presented', pres3: 'presents', ing: 'presenting' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D8%AF%D9%91%D9%8E%D9%85%D9%8E.html' },
      V: { gloss: 'to advance', trans: false,
           en: { past: 'advanced', pres3: 'advances', ing: 'advancing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%82%D9%8E%D8%AF%D9%91%D9%8E%D9%85%D9%8E.html' },
    },
  },
  {
    root: ['ح', 'س', 'ب'], type: 'salim',
    forms: {
      I: { bab: 'ii', gloss: 'to deem / suppose', masdar: 'حُسْبَان', trans: true,
           en: { past: 'deemed', pp: 'deemed', pres3: 'deems', ing: 'deeming' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AD%D9%8E%D8%B3%D9%90%D8%A8%D9%8E.html' },
    },
  },
  {
    root: ['ش', 'ر', 'ك'], type: 'salim',
    forms: {
      III: { gloss: 'to partner with', trans: true,
             en: { past: 'partnered with', pp: 'partnered with', pres3: 'partners with', ing: 'partnering with' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B4%D9%8E%D8%A7%D8%B1%D9%8E%D9%83%D9%8E.html' },
      VIII: { gloss: 'to participate', trans: false,
              en: { past: 'participated', pres3: 'participates', ing: 'participating' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B4%D9%92%D8%AA%D9%8E%D8%B1%D9%8E%D9%83%D9%8E.html' },
    },
  },
  {
    root: ['ح', 'م', 'ر'], type: 'salim',
    forms: {
      IX: { gloss: 'to turn red', trans: false,
            en: { past: 'turned red', pres3: 'turns red', ing: 'turning red' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%AD%D9%92%D9%85%D9%8E%D8%B1%D9%91%D9%8E.html' },
    },
  },
  {
    root: ['ص', 'ف', 'ر'], type: 'salim',
    forms: {
      IX: { gloss: 'to turn yellow', trans: false,
            en: { past: 'turned yellow', pres3: 'turns yellow', ing: 'turning yellow' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B5%D9%92%D9%81%D9%8E%D8%B1%D9%91%D9%8E.html' },
    },
  },
];
