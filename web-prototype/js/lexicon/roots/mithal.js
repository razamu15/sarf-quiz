// Mithāl — the FĀʾ is weak (وَعَدَ, يَئِسَ). Engine-conjugated by
// MithalConjugator, whose main job is the muḍāriʿ: in bāb ḍaraba the kasra on
// the ʿayn crushes the wāw out entirely (وَعَدَ → يَعِدُ, no wāw left to see).
//
// TWO TYPES LIVE HERE, mithal_waw and mithal_ya, split by which letter is weak
// because that is what decides the iʿlāl. The student sees one chip, مِثَال —
// groupOfVerbType() in ../vocabulary.js folds the pair back for display.
//
// Record shape, engine routing and the trans/bab/masdar conventions are
// documented once in the barrel, ../roots.js — read that first.

export const MITHAL_ROOTS = [
  // --- Mithāl wāw · و as first radical ---------------------------------------
  {
    root: ['و', 'ج', 'ب'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to be obligatory', masdar: 'وُجُوب', trans: false,
           en: { past: 'became obligatory', pres3: 'becomes obligatory', ing: 'becoming obligatory' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AC%D9%8E%D8%A8%D9%8E.html' },
      IV: { gloss: 'to make obligatory', trans: true,
            en: { past: 'obligated', pp: 'obligated', pres3: 'obligates', ing: 'obligating' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D8%AC%D9%8E%D8%A8%D9%8E.html' },
      X: { gloss: 'to deserve / merit', trans: true,
           en: { past: 'deserved', pp: 'deserved', pres3: 'deserves', ing: 'deserving' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%88%D9%92%D8%AC%D9%8E%D8%A8%D9%8E.html' },
    },
  },
  {
    root: ['و', 'ص', 'ل'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to reach / connect', masdar: 'وُصُول', trans: true,
           en: { past: 'reached', pp: 'reached', pres3: 'reaches', ing: 'reaching' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%B5%D9%8E%D9%84%D9%8E.html' },
      II: { gloss: 'to connect / deliver', trans: true,
            en: { past: 'connected', pp: 'connected', pres3: 'connects', ing: 'connecting' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%B5%D9%91%D9%8E%D9%84%D9%8E.html' },
      III: { gloss: 'to keep in touch with', trans: true,
             en: { past: 'kept in touch with', pp: 'kept in touch with', pres3: 'keeps in touch with', ing: 'keeping in touch with' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%A7%D8%B5%D9%8E%D9%84%D9%8E.html' },
      IV: { gloss: 'to deliver / bring to', trans: true,
            en: { past: 'delivered', pp: 'delivered', pres3: 'delivers', ing: 'delivering' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D8%B5%D9%8E%D9%84%D9%8E.html' },
      V: { gloss: 'to arrive at a result', trans: false,
           en: { past: 'arrived at', pres3: 'arrives at', ing: 'arriving at' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%B5%D9%91%D9%8E%D9%84%D9%8E.html' },
      VI: { gloss: 'to stay in touch', trans: false,
            en: { past: 'stayed in touch', pres3: 'stays in touch', ing: 'staying in touch' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%A7%D8%B5%D9%8E%D9%84%D9%8E.html' },
      VIII: { gloss: 'to contact / call', trans: true,
              en: { past: 'contacted', pp: 'contacted', pres3: 'contacts', ing: 'contacting' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%AA%D9%91%D9%8E%D8%B5%D9%8E%D9%84%D9%8E.html' },
    },
  },
  {
    root: ['و', 'ج', 'د'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to find', masdar: 'وُجُود', trans: true,
           en: { past: 'found', pp: 'found', pres3: 'finds', ing: 'finding' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AC%D9%8E%D8%AF%D9%8E.html' },
      IV: { gloss: 'to bring into existence', trans: true,
            en: { past: 'created', pp: 'created', pres3: 'creates', ing: 'creating' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D8%AC%D9%8E%D8%AF%D9%8E.html' },
    },
  },
  {
    root: ['و', 'ق', 'ع'], type: 'mithal_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to fall / happen', masdar: 'وُقُوع', trans: false,
           en: { past: 'happened', pres3: 'happens', ing: 'happening' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%82%D9%8E%D8%B9%D9%8E.html' },
      II: { gloss: 'to sign', trans: true,
            en: { past: 'signed', pp: 'signed', pres3: 'signs', ing: 'signing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%82%D9%91%D9%8E%D8%B9%D9%8E.html' },
      III: { gloss: 'to confront / engage with', trans: true,
             en: { past: 'confronted', pp: 'confronted', pres3: 'confronts', ing: 'confronting' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%A7%D9%82%D9%8E%D8%B9%D9%8E.html' },
      IV: { gloss: 'to inflict / cause to fall', trans: true,
            en: { past: 'inflicted', pp: 'inflicted', pres3: 'inflicts', ing: 'inflicting' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D9%82%D9%8E%D8%B9%D9%8E.html' },
      VI: { gloss: 'to clash with one another', trans: false,
            en: { past: 'clashed', pres3: 'clash', ing: 'clashing' } },
    },
  },
  {
    root: ['و', 'ض', 'ع'], type: 'mithal_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to put / place', masdar: 'وَضْع', trans: true,
           en: { past: 'put', pp: 'put', pres3: 'puts', ing: 'putting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%B6%D9%8E%D8%B9%D9%8E.html' },
      III: { gloss: 'to compose together', trans: true,
             en: { past: 'drafted together', pp: 'drafted together', pres3: 'drafts together', ing: 'drafting together' } },
      VI: { gloss: 'to be humble', trans: false,
            en: { past: 'was humble', pres3: 'is humble', ing: 'being humble' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%A7%D8%B6%D9%8E%D8%B9%D9%8E.html' },
      VIII: { gloss: 'to be lowered / humbled', trans: false,
              en: { past: 'was humbled', pres3: 'gets humbled', ing: 'getting humbled' } },
    },
  },
  {
    root: ['و', 'ه', 'ب'], type: 'mithal_waw',
    forms: {
      I: { bab: 'aa', gloss: 'to grant / bestow', masdar: 'هِبَة', trans: true,
           en: { past: 'granted', pp: 'granted', pres3: 'grants', ing: 'granting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D9%87%D9%8E%D8%A8%D9%8E.html' },
      X: { gloss: 'to ask for a gift', trans: true,
           en: { past: 'asked for a gift', pp: 'asked of', pres3: 'asks for a gift', ing: 'asking for a gift' } },
    },
  },
  {
    root: ['و', 'ج', 'ل'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ia', gloss: 'to fear / be afraid', masdar: 'وَجَل', trans: false,
           en: { past: 'feared', pres3: 'fears', ing: 'fearing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AC%D9%90%D9%84%D9%8E.html' },
      IV: { gloss: 'to frighten', trans: true,
            en: { past: 'frightened', pp: 'frightened', pres3: 'frightens', ing: 'frightening' } },
    },
  },
  {
    root: ['و', 'ج', 'ع'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ia', gloss: 'to hurt / feel pain', masdar: 'وَجَع', trans: true,
           en: { past: 'hurt', pres3: 'hurts', ing: 'hurting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AC%D9%90%D8%B9%D9%8E.html' },
      IV: { gloss: 'to cause pain to', trans: true,
            en: { past: 'caused pain to', pp: 'pained', pres3: 'causes pain to', ing: 'causing pain to' } },
    },
  },
  {
    root: ['و', 'ث', 'ق'], type: 'mithal_waw',
    forms: {
      I: { bab: 'ai', gloss: 'to trust', masdar: 'ثِقَة', trans: false,
           en: { past: 'trusted', pres3: 'trusts', ing: 'trusting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AB%D9%90%D9%82%D9%8E.html' },
      II: { gloss: 'to document / verify', trans: true,
            en: { past: 'documented', pp: 'documented', pres3: 'documents', ing: 'documenting' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AB%D9%91%D9%8E%D9%82%D9%8E.html' },
      III: { gloss: 'to make a covenant with', trans: true,
             en: { past: 'made a pact with', pp: 'covenanted with', pres3: 'makes a pact with', ing: 'making a pact with' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%A7%D8%AB%D9%8E%D9%82%D9%8E.html' },
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
      I: { bab: 'uu', gloss: 'to be distinguished', masdar: 'وَجَاهَة', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AC%D9%8F%D9%87%D9%8E.html' },
      II: { gloss: 'to direct / orient', trans: true,
            en: { past: 'directed', pp: 'directed', pres3: 'directs', ing: 'directing' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%AC%D9%91%D9%8E%D9%87%D9%8E.html' },
      III: { gloss: 'to face / confront', trans: true,
             en: { past: 'faced', pp: 'faced', pres3: 'faces', ing: 'facing' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%A7%D8%AC%D9%8E%D9%87%D9%8E.html' },
      V: { gloss: 'to head towards', trans: false,
           en: { past: 'headed towards', pres3: 'heads towards', ing: 'heading towards' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%AC%D9%91%D9%8E%D9%87%D9%8E.html' },
      VI: { gloss: 'to face one another', trans: false,
            en: { past: 'faced one another', pres3: 'face one another', ing: 'facing one another' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%A7%D8%AC%D9%8E%D9%87%D9%8E.html' },
    },
  },
  {
    root: ['و', 'ر', 'ث'], type: 'mithal_waw',
    forms: {
      // Source notes read "abb" for the vowel pair, which is not one of the six
      // — وَرِثَ يَرِثُ is kasra/kasra, so `ii`. Flagged for your check.
      I: { bab: 'ii', gloss: 'to inherit', masdar: 'إِرْث', trans: true,
           en: { past: 'inherited', pp: 'inherited', pres3: 'inherits', ing: 'inheriting' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%B1%D9%90%D8%AB%D9%8E.html' },
      II: { gloss: 'to bequeath / pass down', trans: true,
            en: { past: 'bequeathed', pp: 'bequeathed', pres3: 'bequeaths', ing: 'bequeathing' } },
      IV: { gloss: 'to cause to inherit', trans: true,
            en: { past: 'passed on', pp: 'passed on', pres3: 'passes on', ing: 'passing on' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D8%B1%D9%8E%D8%AB%D9%8E.html' },
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
           en: { past: 'promised', pp: 'promised', pres3: 'promises', ing: 'promising' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%B9%D9%8E%D8%AF%D9%8E.html' },
      III: { gloss: 'to make an appointment with', trans: true,
             en: { past: 'made an appointment with', pp: 'appointed with', pres3: 'makes an appointment with', ing: 'making an appointment with' },
             reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%88%D9%8E%D8%A7%D8%B9%D9%8E%D8%AF%D9%8E.html' },
      IV: { gloss: 'to threaten', trans: true,
            en: { past: 'threatened', pp: 'threatened', pres3: 'threatens', ing: 'threatening' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%88%D9%92%D8%B9%D9%8E%D8%AF%D9%8E.html' },
      V: { gloss: 'to threaten repeatedly', trans: true,
           en: { past: 'threatened', pp: 'threatened', pres3: 'threatens', ing: 'threatening' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%B9%D9%91%D9%8E%D8%AF%D9%8E.html' },
      VI: { gloss: 'to promise one another', trans: false,
            en: { past: 'promised one another', pres3: 'promise one another', ing: 'promising one another' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%88%D9%8E%D8%A7%D8%B9%D9%8E%D8%AF%D9%8E.html' },
      // اِتَّعَدَ — the faa vanishes into the taa. This is the root that exercises
      // MITHAL_STEMS.VIII, whose templates never mention radical 1.
      VIII: { gloss: 'to accept a promise', trans: true,
              en: { past: 'accepted a promise', pp: 'accepted', pres3: 'accepts a promise', ing: 'accepting a promise' },
              reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%AA%D9%91%D9%8E%D8%B9%D9%8E%D8%AF%D9%8E.html' },
    },
  },
  // --- Mithāl yāʾ · ي as first radical ---------------------------------------
  // Several of these are also hamzated (يَئِسَ) or near it; classify() types them
  // by their weakness, which is the harder rule and the one that decides the
  // engine. That is why they are not in mahmuz.js.
  {
    root: ['ي', 'ء', 'س'], type: 'mithal_ya',
    forms: {
      I: { bab: 'ia', gloss: 'to despair', masdar: 'يَأْس', trans: false,
           en: { past: 'despaired', pres3: 'despairs', ing: 'despairing' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D8%A6%D9%90%D8%B3%D9%8E.html' },
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
            en: { past: 'ascertained', pp: 'ascertained', pres3: 'ascertains', ing: 'ascertaining' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%8A%D9%92%D9%82%D9%8E%D9%86%D9%8E.html' },
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
           en: { past: 'was lucky', pres3: 'is lucky', ing: 'being lucky' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D9%85%D9%8E%D9%86%D9%8E.html' },
      II: { gloss: 'to go to the right', trans: true,
            en: { past: 'went to the right', pp: 'went to the right', pres3: 'goes to the right', ing: 'going to the right' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D9%85%D9%91%D9%8E%D9%86%D9%8E.html' },
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
      I: { bab: 'ia', gloss: 'to be awake / vigilant', masdar: 'يَقَاظَة', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D9%82%D9%8F%D8%B8%D9%8E.html' },
      IV: { gloss: 'to wake someone up', trans: true,
            en: { past: 'woke up', pp: 'woken up', pres3: 'wakes up', ing: 'waking up' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A3%D9%8E%D9%8A%D9%92%D9%82%D9%8E%D8%B8%D9%8E.html' },
      V: { gloss: 'to become alert', trans: false,
           en: { past: 'became alert', pres3: 'becomes alert', ing: 'becoming alert' } },
      X: { gloss: 'to wake up', trans: true,
           en: { past: 'woke up', pres3: 'wakes up', ing: 'waking up' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%A7%D9%90%D8%B3%D9%92%D8%AA%D9%8E%D9%8A%D9%92%D9%82%D9%8E%D8%B8%D9%8E.html' },
    },
  },
  {
    root: ['ي', 'ب', 'س'], type: 'mithal_ya',
    forms: {
      // يَبِسَ يَيْبَسُ, bab سَمِعَ — the stative فَعِلَ pattern, so the fatha on the
      // mudari ayn is its own and the ya stays. The doublet يَبَسَ يَيْبِسُ (bab
      // ai) is also attested; only the kasra form is listed.
      I: { bab: 'ia', gloss: 'to be dry', masdar: 'يُبْس', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D8%A8%D9%90%D8%B3%D9%8E.html' },
      II: { gloss: 'to dry something out', trans: true,
            en: { past: 'dried out', pp: 'dried out', pres3: 'dries out', ing: 'drying out' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D8%A8%D9%91%D9%8E%D8%B3%D9%8E.html' },
      IV: { gloss: 'to dry up / wither', trans: true,
            en: { past: 'dried up', pp: 'dried up', pres3: 'dries up', ing: 'drying up' } },
    },
  },
  {
    root: ['ي', 'ف', 'ع'], type: 'mithal_ya',
    forms: {
      // bab فَتَحَ, which needs a ḥarf ḥalq to license the fatḥa — the ʿayn as
      // lām supplies it here. The first `aa` mithāl yāʾ in the lexicon.
      I: { bab: 'aa', gloss: 'to reach adolescence', masdar: 'يَفَاعَة', trans: false,
           en: { past: 'reached adolescence', pres3: 'reaches adolescence', ing: 'reaching adolescence' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D9%81%D9%8E%D8%B9%D9%8E.html' },
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
      I: { bab: 'uu', gloss: 'to be orphaned', masdar: 'يُتْم', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D8%AA%D9%8F%D9%85%D9%8E.html' },
      II: { gloss: 'to orphan', trans: true,
            en: { past: 'orphaned', pp: 'orphaned', pres3: 'orphans', ing: 'orphaning' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D8%AA%D9%91%D9%8E%D9%85%D9%8E.html' },
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
      I: { bab: 'ia', gloss: 'to be easy', masdar: 'يُسْر', trans: false,
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D8%B3%D9%8F%D8%B1%D9%8E.html' },
      II: { gloss: 'to make easy', trans: true,
            en: { past: 'made easy', pp: 'made easy', pres3: 'makes easy', ing: 'making easy' },
            reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D9%8A%D9%8E%D8%B3%D9%91%D9%8E%D8%B1%D9%8E.html' },
      IV: { gloss: 'to become well off', trans: false,
            en: { past: 'became well off', pres3: 'becomes well off', ing: 'becoming well off' } },
      V: { gloss: 'to become easy', trans: false,
           en: { past: 'became easy', pres3: 'becomes easy', ing: 'becoming easy' },
           reverso: 'https://conjugator.reverso.net/conjugation-arabic-verb-%D8%AA%D9%8E%D9%8A%D9%8E%D8%B3%D9%91%D9%8E%D8%B1%D9%8E.html' },
      X: { gloss: 'to be made easy', trans: false,
           en: { past: 'was made easy', pres3: 'is made easy', ing: 'being made easy' } },
    },
  },
];
