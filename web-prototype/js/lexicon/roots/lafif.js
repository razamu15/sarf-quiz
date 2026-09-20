// Lafīf — TWO weak radicals in one root. Mafrūq ("separated"): the fāʾ and the
// lām are weak with a sound ʿayn between them (وَقَى). Maqrūn ("joined"): the
// two weak letters sit next to each other (طَوَى).
//
// NO ENGINE YET. These roots carry no manualTables, so hasEngine() reports
// false and they stay out of every quiz and every count until a conjugator
// lands. They are here now because content authoring is parallel-track: the day
// the engine ships, لَفِيف becomes playable with everything behind it at once.
// availableTypes() additionally gates both on settings.lafifVerbs.
//
// UNLIKE EVERY OTHER WEAK TYPE, the two lafīf types are NOT folded into one
// chip. They split on WHERE the weak letters sit rather than on which letter
// they are, and that is a distinction students are taught by name and asked to
// tell apart — so type === group for both, and the UI shows two chips. See the
// note above VERB_TYPE_IDS in ../vocabulary.js.
//
// Record shape, engine routing and the trans/bab/masdar conventions are
// documented once in the barrel, ../roots.js — read that first.

export const LAFIF_ROOTS = [
  // --- Lafīf mafrūq · weak fāʾ and weak lām, sound ʿayn (وَقَى) ---------------
  {
    root: ['و', 'ل', 'ي'], type: 'lafif_mafruq',
    note: 'Lafīf mafrūq (mithāl wāw + nāqiṣ yāʾ); Form I drops the wāw: وَلِيَ / يَلِي.',
    forms: {
      I: { bab: 'ii', gloss: 'to follow / to be adjacent to / to be in charge of', masdar: 'وِلَايَة', trans: true,
           en: { past: 'followed', pp: 'followed', pres3: 'follows', ing: 'following' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%84%D9%90%D9%8A%D9%8E.html' },
      II: { gloss: 'to turn away / to appoint / to put in charge', masdar: 'تَوْلِيَة', trans: true,
            en: { past: 'appointed', pp: 'appointed', pres3: 'appoints', ing: 'appointing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%84%D9%91%D9%8E%D9%89.html' },
      III: { gloss: 'to befriend / to follow in succession', masdar: 'مُوَالَاة', trans: true,
             en: { past: 'allied with', pp: 'allied with', pres3: 'allies with', ing: 'allying with' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%A7%D9%84%D9%8E%D9%89.html' },
      IV: { gloss: 'to grant / to accord / to give (attention)', masdar: 'إِيلَاء', trans: true,
            en: { past: 'accorded', pp: 'accorded', pres3: 'accords', ing: 'according' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D9%84%D9%8E%D9%89.html' },
      V: { gloss: 'to take charge of / to assume / to turn away', masdar: 'تَوَلٍّ', trans: true,
           en: { past: 'took charge of', pp: 'taken charge of', pres3: 'takes charge of', ing: 'taking charge of' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D9%84%D9%91%D9%8E%D9%89.html' },
      VI: { gloss: 'to follow one another in succession', masdar: 'تَوَالٍ', trans: false,
            en: { past: 'followed in succession', pres3: 'follows in succession', ing: 'following in succession' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%A7%D9%84%D9%8E%D9%89.html' },
      X: { gloss: 'to take possession of / to seize', masdar: 'اِسْتِيلَاء', trans: false,
           en: { past: 'seized control of', pres3: 'seizes control of', ing: 'seizing control of' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%88%D9%92%D9%84%D9%8E%D9%89.html' },
    },
  },
  {
    root: ['و', 'ص', 'ي'], type: 'lafif_mafruq',
    note: 'Lafīf mafrūq (mithāl wāw + nāqiṣ yāʾ); Form I is archaic in MSA.',
    forms: {
      II: { gloss: 'to enjoin / to instruct / to bequeath to', masdar: 'تَوْصِيَة', trans: true,
            en: { past: 'instructed', pp: 'instructed', pres3: 'instructs', ing: 'instructing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%B5%D9%91%D9%8E%D9%89.html' },
      IV: { gloss: 'to enjoin / to recommend / to bequeath', masdar: 'إِيصَاء', trans: true,
            en: { past: 'bequeathed', pp: 'bequeathed', pres3: 'bequeaths', ing: 'bequeathing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D8%B5%D9%8E%D9%89.html' },
      VI: { gloss: 'to enjoin one another', masdar: 'تَوَاصٍ', trans: false,
            en: { past: 'enjoined one another', pres3: 'enjoin one another', ing: 'enjoining one another' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%A7%D8%B5%D9%8E%D9%89.html' },
      X: { gloss: 'to ask for advice / to accept a recommendation', masdar: 'اِسْتِيصَاء', trans: false,
           en: { past: 'sought counsel', pres3: 'seeks counsel', ing: 'seeking counsel' } },
    },
  },
  {
    root: ['و', 'ر', 'ي'], type: 'lafif_mafruq',
    note: 'Lafīf mafrūq (mithāl wāw + nāqiṣ yāʾ).',
    forms: {
      II: { gloss: 'to conceal / to allude indirectly / to insinuate', masdar: 'تَوْرِيَة', trans: true,
            en: { past: 'concealed', pp: 'concealed', pres3: 'conceals', ing: 'concealing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%B1%D9%91%D9%8E%D9%89.html' },
      III: { gloss: 'to hide / to cover up', masdar: 'مُوَارَاة', trans: true,
             en: { past: 'hid', pp: 'hidden', pres3: 'hides', ing: 'hiding' } },
      IV: { gloss: 'to kindle / to strike (fire)', masdar: 'إِيرَاء', trans: true,
            en: { past: 'kindled', pp: 'kindled', pres3: 'kindles', ing: 'kindling' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D8%B1%D9%8E%D9%89.html' },
      VI: { gloss: 'to hide oneself / to disappear from view', masdar: 'تَوَارٍ', trans: false,
            en: { past: 'disappeared', pres3: 'disappears', ing: 'disappearing' } },
    },
  },
  {
    root: ['و', 'ف', 'ي'], type: 'lafif_mafruq',
    note: 'Type this one fully vocalized as وَفَّى — bare وفّى returns the Form I paradigm. Lafīf mafrūq root.',
    forms: {
      I: { bab: 'ai', gloss: 'to be faithful / true', masdar: 'وَفَاء', trans: false,
           en: { past: 'kept faith', pres3: 'keeps faith', ing: 'keeping faith' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%81%D9%8E%D9%89.html' },
      II: { gloss: 'to fulfil in full / to pay in full', masdar: 'تَوْفِيَة', trans: true,
            en: { past: 'paid in full', pp: 'paid in full', pres3: 'pays in full', ing: 'paying in full' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%81%D9%91%D9%8E%D9%89.html' },
      III: { gloss: 'to arrive at / to come to / to supply', masdar: 'مُوَافَاة', trans: true,
             en: { past: 'supplied', pp: 'supplied', pres3: 'supplies', ing: 'supplying' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%A7%D9%81%D9%8E%D9%89.html' },
      IV: { gloss: 'to fulfil / to pay in full / to be ample', masdar: 'إِيفَاء', trans: true,
            en: { past: 'fulfilled', pp: 'fulfilled', pres3: 'fulfils', ing: 'fulfilling' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D9%81%D9%8E%D9%89.html' },
      V: { gloss: 'to take in full; (passive تُوُفِّيَ) to pass away', masdar: 'تَوَفٍّ', trans: true,
           en: { past: 'took in full', pp: 'taken in full', pres3: 'takes in full', ing: 'taking in full' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D9%81%D9%91%D9%8E%D9%89.html' },
      X: { gloss: 'to collect in full / to exhaust / to satisfy', masdar: 'اِسْتِيفَاء', trans: true,
           en: { past: 'collected in full', pp: 'collected in full', pres3: 'collects in full', ing: 'collecting in full' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%88%D9%92%D9%81%D9%8E%D9%89.html' },
    },
  },
  {
    root: ['و', 'ق', 'ي'], type: 'lafif_mafruq',
    forms: {
      I: { bab: 'ai', gloss: 'to protect / to guard', masdar: 'وِقَايَة', trans: true,
           en: { past: 'protected', pp: 'protected', pres3: 'protects', ing: 'protecting' } },
      VIII: { gloss: 'to fear God / to guard against', trans: true,
              en: { past: 'feared God', pp: 'guarded against', pres3: 'fears God', ing: 'fearing God' } },
    },
  },
  {
    root: ['و', 'ع', 'ي'], type: 'lafif_mafruq',
    forms: {
      I: { bab: 'ia', gloss: 'to grasp / to comprehend', masdar: 'وَعْي', trans: true,
           en: { past: 'grasped', pp: 'grasped', pres3: 'grasps', ing: 'grasping' } },
      IV: { gloss: 'to retain / to store up', trans: true,
            en: { past: 'retained', pp: 'retained', pres3: 'retains', ing: 'retaining' } },
    },
  },
  {
    root: ['و', 'د', 'ي'], type: 'lafif_mafruq',
    forms: {
      I: { bab: 'ai', gloss: 'to pay blood money for', masdar: 'دِيَة', trans: true,
           en: { past: 'paid blood money for', pp: 'paid for', pres3: 'pays blood money for', ing: 'paying blood money for' } },
      II: { gloss: 'to discharge / to carry out', trans: true,
            en: { past: 'discharged', pp: 'discharged', pres3: 'discharges', ing: 'discharging' } },
    },
  },
  {
    root: ['و', 'ه', 'ي'], type: 'lafif_mafruq',
    forms: {
      I: { bab: 'ai', gloss: 'to be weak / frail', masdar: 'وَهْي', trans: false },
    },
  },
  // --- Lafīf maqrūn · the two weak letters adjacent (طَوَى) -------------------
  {
    root: ['ح', 'ي', 'ي'], type: 'lafif_maqrun',
    note: 'Technically lafīf maqrūn (ʿayn and lām both yāʾ); Form II is written حَيَّا with alif.',
    forms: {
      I: { bab: 'ia', gloss: 'to live', masdar: 'حَيَاة', trans: false,
           en: { past: 'lived', pres3: 'lives', ing: 'living' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AD%D9%8E%D9%8A%D9%90%D9%8A%D9%8E.html' },
      II: { gloss: 'to greet / to salute', masdar: 'تَحِيَّة', trans: true,
            en: { past: 'greeted', pp: 'greeted', pres3: 'greets', ing: 'greeting' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AD%D9%8E%D9%8A%D9%91%D9%8E%D8%A7.html' },
      IV: { gloss: 'to bring to life / to revive', masdar: 'إِحْيَاء', trans: true,
            en: { past: 'revived', pp: 'revived', pres3: 'revives', ing: 'reviving' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D8%AD%D9%92%D9%8A%D9%8E%D8%A7.html' },
      X: { gloss: 'to be ashamed / shy', masdar: 'اِسْتِحْيَاء', trans: false,
           en: { past: 'was ashamed', pres3: 'is ashamed', ing: 'being ashamed' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D8%AD%D9%92%D9%8A%D9%8E%D8%A7.html' },
    },
  },
  {
    root: ['ق', 'و', 'ي'], type: 'lafif_maqrun',
    note: 'Lafīf maqrūn root; the doubled ʿayn in Form II makes it conjugate as plain nāqiṣ.',
    forms: {
      I: { bab: 'ia', gloss: 'to be strong', masdar: 'قُوَّة', trans: false,
           en: { past: 'was strong', pres3: 'is strong', ing: 'being strong' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D9%88%D9%90%D9%8A%D9%8E.html' },
      II: { gloss: 'to strengthen / to reinforce', masdar: 'تَقْوِيَة', trans: true,
            en: { past: 'strengthened', pp: 'strengthened', pres3: 'strengthens', ing: 'strengthening' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%82%D9%8E%D9%88%D9%91%D9%8E%D9%89.html' },
      V: { gloss: 'to grow strong / to gain strength', masdar: 'تَقَوٍّ', trans: false,
           en: { past: 'grew strong', pres3: 'grows strong', ing: 'growing strong' } },
      VIII: { gloss: 'to grow stronger', trans: false,
              en: { past: 'grew stronger', pres3: 'grows stronger', ing: 'growing stronger' } },
      X: { gloss: 'to become strong / to gather strength', masdar: 'اِسْتِقْوَاء', trans: false,
           en: { past: 'became strong', pres3: 'becomes strong', ing: 'becoming strong' } },
    },
  },
  {
    root: ['س', 'و', 'ي'], type: 'lafif_maqrun',
    note: 'Lafīf maqrūn root; Form II conjugates as plain nāqiṣ.',
    forms: {
      I: { bab: 'ia', gloss: 'to be worth / to be equal to', masdar: 'سِوًى', trans: true,
           en: { past: 'was worth', pp: 'worth', pres3: 'is worth', ing: 'being worth' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%8E%D9%88%D9%90%D9%8A%D9%8E.html' },
      II: { gloss: 'to level / to settle / to make equal', masdar: 'تَسْوِيَة', trans: true,
            en: { past: 'levelled', pp: 'levelled', pres3: 'levels', ing: 'levelling' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%8E%D9%88%D9%91%D9%8E%D9%89.html' },
      III: { gloss: 'to equal / to be worth', masdar: 'مُسَاوَاة', trans: true,
             en: { past: 'equalled', pp: 'equalled', pres3: 'equals', ing: 'equalling' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%B3%D9%8E%D8%A7%D9%88%D9%8E%D9%89.html' },
      VI: { gloss: 'to be equal to one another', masdar: 'تَسَاوٍ', trans: false,
            en: { past: 'were equal', pres3: 'are equal', ing: 'being equal' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D8%B3%D9%8E%D8%A7%D9%88%D9%8E%D9%89.html' },
      VIII: { gloss: 'to be level / even', masdar: 'اِسْتِوَاء', trans: false,
              en: { past: 'was level', pres3: 'is level', ing: 'being level' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%88%D9%8E%D9%89.html' },
    },
  },
  {
    root: ['ط', 'و', 'ي'], type: 'lafif_maqrun',
    forms: {
      I: { bab: 'ai', gloss: 'to fold / to roll up', masdar: 'طَيّ', trans: true,
           en: { past: 'folded', pp: 'folded', pres3: 'folds', ing: 'folding' } },
      VII: { gloss: 'to be folded up', trans: false },
    },
  },
  {
    root: ['ر', 'و', 'ي'], type: 'lafif_maqrun',
    forms: {
      I: { bab: 'ai', gloss: 'to narrate / to relate', masdar: 'رِوَايَة', trans: true,
           en: { past: 'narrated', pp: 'narrated', pres3: 'narrates', ing: 'narrating' } },
      II: { gloss: 'to irrigate / to water', trans: true,
            en: { past: 'irrigated', pp: 'irrigated', pres3: 'irrigates', ing: 'irrigating' } },
      IV: { gloss: 'to quench the thirst of', trans: true,
            en: { past: 'quenched', pp: 'quenched', pres3: 'quenches', ing: 'quenching' } },
    },
  },
  {
    root: ['ن', 'و', 'ي'], type: 'lafif_maqrun',
    forms: {
      I: { bab: 'ai', gloss: 'to intend', masdar: 'نِيَّة', trans: true,
           en: { past: 'intended', pp: 'intended', pres3: 'intends', ing: 'intending' } },
    },
  },
  {
    root: ['ش', 'و', 'ي'], type: 'lafif_maqrun',
    forms: {
      I: { bab: 'ai', gloss: 'to grill / to roast', masdar: 'شَيّ', trans: true,
           en: { past: 'grilled', pp: 'grilled', pres3: 'grills', ing: 'grilling' } },
      VIII: { gloss: 'to be grilled', trans: false },
    },
  },
];
