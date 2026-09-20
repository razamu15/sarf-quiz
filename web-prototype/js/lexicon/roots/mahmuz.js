// Mahmūz — one radical is a hamza (أَخَذَ, سَأَلَ, قَرَأَ). The root is otherwise
// sound; what makes it its own type is orthographic, not morphological: the
// hamza's SEAT changes with the surrounding vowels (يَأْخُذُ but أُوخَذُ), and
// getting the seat wrong is the whole difficulty of the type.
//
// NO ENGINE YET, and no content yet — this file is the empty home the mahmūz
// roots land in. classify() in ../lexicon-service.js already returns 'mahmuz'
// for a hamzated root, and availableTypes() gates the type off behind
// settings.mahmuzVerbs, so roots added here stay out of every quiz until both
// the engine and the flag are ready. Nothing else needs to change to fill it.
//
// One classification note, because it decides what belongs here: a root that is
// BOTH weak and hamzated (يَئِسَ — yāʾ first, hamza second) is NOT mahmūz. It is
// typed by its weakness, which is the harder rule and the one that picks the
// engine. Those roots live in mithal.js. Only roots whose sole irregularity is
// the hamza belong in this file.
//
// Record shape, engine routing and the trans/bab/masdar conventions are
// documented once in the barrel, ../roots.js — read that first.

export const MAHMUZ_ROOTS = [
  {
    root: ['ء', 'خ', 'ذ'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to take', masdar: 'أَخْذ', trans: true,
           en: { past: 'took', pp: 'taken', pres3: 'takes', ing: 'taking' } },
      III: { gloss: 'to blame / to call to account', trans: true,
             en: { past: 'blamed', pp: 'blamed', pres3: 'blames', ing: 'blaming' } },
      VIII: { gloss: 'to adopt / to take on', trans: true,
              en: { past: 'adopted', pp: 'adopted', pres3: 'adopts', ing: 'adopting' } },
    },
  },
  {
    root: ['ء', 'ك', 'ل'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to eat', masdar: 'أَكْل', trans: true,
           en: { past: 'ate', pp: 'eaten', pres3: 'eats', ing: 'eating' } },
      II: { gloss: 'to feed', trans: true,
            en: { past: 'fed', pp: 'fed', pres3: 'feeds', ing: 'feeding' } },
    },
  },
  {
    root: ['ء', 'م', 'ر'], type: 'mahmuz',
    forms: {
      I: { bab: 'au', gloss: 'to command', masdar: 'أَمْر', trans: true,
           en: { past: 'commanded', pp: 'commanded', pres3: 'commands', ing: 'commanding' } },
      III: { gloss: 'to consult', trans: true,
             en: { past: 'consulted', pp: 'consulted', pres3: 'consults', ing: 'consulting' } },
      V: { gloss: 'to take command', trans: false,
           en: { past: 'took command', pres3: 'takes command', ing: 'taking command' } },
      VI: { gloss: 'to conspire', trans: false,
            en: { past: 'conspired', pres3: 'conspires', ing: 'conspiring' } },
      X: { gloss: 'to ask the permission of', trans: true,
           en: { past: 'asked permission of', pp: 'consulted', pres3: 'asks permission of', ing: 'asking permission of' } },
    },
  },
  {
    root: ['ء', 'ذ', 'ن'], type: 'mahmuz',
    forms: {
      I: { bab: 'ia', gloss: 'to permit', masdar: 'إِذْن', trans: false,
           en: { past: 'permitted', pres3: 'permits', ing: 'permitting' } },
      II: { gloss: 'to call to prayer', trans: false,
            en: { past: 'called to prayer', pres3: 'calls to prayer', ing: 'calling to prayer' } },
      IV: { gloss: 'to notify / to announce to', trans: true,
            en: { past: 'notified', pp: 'notified', pres3: 'notifies', ing: 'notifying' } },
      X: { gloss: 'to ask permission', trans: false,
           en: { past: 'asked permission', pres3: 'asks permission', ing: 'asking permission' } },
    },
  },
  {
    root: ['س', 'ء', 'ل'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to ask', masdar: 'سُؤَال', trans: true,
           en: { past: 'asked', pp: 'asked', pres3: 'asks', ing: 'asking' } },
      VI: { gloss: 'to wonder / to ask one another', trans: false,
            en: { past: 'wondered', pres3: 'wonders', ing: 'wondering' } },
    },
  },
  {
    root: ['ق', 'ر', 'ء'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to read', masdar: 'قِرَاءَة', trans: true,
           en: { past: 'read', pp: 'read', pres3: 'reads', ing: 'reading' } },
      IV: { gloss: 'to make (someone) read', trans: true,
            en: { past: 'made read', pp: 'made to read', pres3: 'makes read', ing: 'making read' } },
    },
  },
  {
    root: ['ب', 'د', 'ء'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to begin', masdar: 'بَدْء', trans: true,
           en: { past: 'began', pp: 'begun', pres3: 'begins', ing: 'beginning' } },
      IV: { gloss: 'to originate / to bring about', trans: true,
            en: { past: 'originated', pp: 'originated', pres3: 'originates', ing: 'originating' } },
      VIII: { gloss: 'to commence', trans: true,
              en: { past: 'commenced', pp: 'commenced', pres3: 'commences', ing: 'commencing' } },
    },
  },
  {
    root: ['ن', 'ش', 'ء'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to arise / to grow up', masdar: 'نَشْأَة', trans: false,
           en: { past: 'arose', pres3: 'arises', ing: 'arising' } },
      IV: { gloss: 'to establish / to compose', trans: true,
            en: { past: 'established', pp: 'established', pres3: 'establishes', ing: 'establishing' } },
    },
  },
  {
    root: ['م', 'ل', 'ء'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to fill', masdar: 'مَلْء', trans: true,
           en: { past: 'filled', pp: 'filled', pres3: 'fills', ing: 'filling' } },
      VIII: { gloss: 'to become full', trans: false,
              en: { past: 'became full', pres3: 'becomes full', ing: 'becoming full' } },
    },
  },
  {
    root: ['ء', 'م', 'ن'], type: 'mahmuz',
    forms: {
      I: { bab: 'ia', gloss: 'to be safe / secure', masdar: 'أَمْن', trans: false },
      II: { gloss: 'to secure / to insure', trans: true,
            en: { past: 'secured', pp: 'secured', pres3: 'secures', ing: 'securing' } },
      IV: { gloss: 'to believe', trans: false,
            en: { past: 'believed', pres3: 'believes', ing: 'believing' } },
    },
  },
  {
    root: ['ء', 'س', 'ف'], type: 'mahmuz',
    forms: {
      I: { bab: 'ia', gloss: 'to be sorry / regretful', masdar: 'أَسَف', trans: false },
      V: { gloss: 'to express regret', trans: false,
           en: { past: 'expressed regret', pres3: 'expresses regret', ing: 'expressing regret' } },
    },
  },
  {
    root: ['ر', 'ء', 'س'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to head / to lead', masdar: 'رِئَاسَة', trans: true,
           en: { past: 'headed', pp: 'headed', pres3: 'heads', ing: 'heading' } },
      V: { gloss: 'to preside over', trans: true,
           en: { past: 'presided over', pp: 'presided over', pres3: 'presides over', ing: 'presiding over' } },
    },
  },
  {
    root: ['ب', 'ر', 'ء'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to be free of / clear of', masdar: 'بَرَاءَة', trans: false },
      II: { gloss: 'to acquit / to clear', trans: true,
            en: { past: 'acquitted', pp: 'acquitted', pres3: 'acquits', ing: 'acquitting' } },
    },
  },
  {
    root: ['ه', 'ن', 'ء'], type: 'mahmuz',
    forms: {
      I: { bab: 'aa', gloss: 'to be pleasant / agreeable', masdar: 'هَنَاء', trans: false },
      II: { gloss: 'to congratulate', trans: true,
            en: { past: 'congratulated', pp: 'congratulated', pres3: 'congratulates', ing: 'congratulating' } },
    },
  },
  {
    root: ['ء', 'ل', 'م'], type: 'mahmuz',
    forms: {
      I: { bab: 'ia', gloss: 'to be in pain', masdar: 'أَلَم', trans: false },
      IV: { gloss: 'to cause pain to', trans: true,
            en: { past: 'hurt', pp: 'hurt', pres3: 'hurts', ing: 'hurting' } },
      V: { gloss: 'to suffer', trans: false,
           en: { past: 'suffered', pres3: 'suffers', ing: 'suffering' } },
    },
  },
];
