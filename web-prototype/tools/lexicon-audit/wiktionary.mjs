// Source adapter: English Wiktionary, via the MediaWiki API.
//
// Called by audit.mjs, which is the only consumer. Nothing in the app imports
// this — it is authoring tooling, run by hand while adding roots to
// js/lexicon/roots/, never at runtime.
//
// WHY WIKTIONARY. Its Arabic verb entries carry the four facts the lexicon
// needs in machine-readable templates rather than prose:
//
//   {{ar-verb|I/a~u.pass.vn:كِتَابَة,كَتْب,كِتَاب}} {{tlb|ar|transitive}}
//            │ │   │    │                          └─ transitivity label
//            │ │   │    └─ verbal nouns  → forms.I.masdar
//            │ │   └─ admits a full passive → evidence for forms.*.trans
//            │ └─ the BAB, as the vowel pair → forms.I.bab ('au')
//            └─ the form number → the key in forms
//
// and "Category:Arabic terms belonging to the root ك ت ب" lists every attested
// derivative, which is how we discover mazīd forms the lexicon is missing.
//
// WHAT IT CANNOT ANSWER. Wiktionary labels transitivity on roughly a third of
// entries. This adapter therefore reports transitivity as three-valued and
// NEVER guesses: a verb with no label and no passive comes back `null`, which
// audit.mjs prints as "source silent". Turning that into `false` would put a
// fabricated fact into a quiz. See the note on `trans` in ../../js/lexicon/roots.js.

const API = 'https://en.wiktionary.org/w/api.php';
// Wikimedia asks anonymous clients for a descriptive UA and serial, paced
// requests. Going faster earns a 429 that reads exactly like "root not
// attested", which would silently corrupt an audit.
const UA = 'sarf-quiz-lexicon-audit/1.0 (personal Arabic morphology study app)';
const MIN_GAP_MS = 1100;

let lastCall = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: 'json', formatversion: '2' })}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const gap = MIN_GAP_MS - (Date.now() - lastCall);
    if (gap > 0) await sleep(gap);
    lastCall = Date.now();
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    // Only throttling is worth retrying; a 404 means the page is genuinely
    // absent and retrying would just be slower.
    if (res.status !== 429 && res.status !== 503) {
      throw new Error(`wiktionary ${res.status} for ${params.titles ?? params.cmtitle}`);
    }
    const retryAfter = Number(res.headers.get('retry-after')) || 5 * 2 ** attempt;
    await sleep(retryAfter * 1000);
  }
  throw new Error('wiktionary: still throttled after 5 attempts');
}

/** Every page in the root's category — the attested derivatives of the root. */
async function rootTerms(radicals) {
  const d = await api({
    action: 'query', list: 'categorymembers', cmlimit: '500',
    cmtitle: `Category:Arabic terms belonging to the root ${radicals.join(' ')}`,
  });
  return (d.query?.categorymembers ?? []).map((m) => m.title);
}

/** Wikitext for many pages at once; 40 per request is well inside the API cap. */
async function pagesWikitext(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 40) {
    const d = await api({
      action: 'query', prop: 'revisions', rvslots: 'main', rvprop: 'content',
      titles: titles.slice(i, i + 40).join('|'),
    });
    for (const p of d.query?.pages ?? []) {
      const content = p.revisions?.[0]?.slots?.main?.content;
      if (content) out.set(p.title, content);
    }
  }
  return out;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/**
 * Every Arabic verb sense on one page, as
 * { form, bab, passive, trans, labels, masdar, glosses }.
 *
 * A page routinely holds SEVERAL senses of the same form number — قدم has three
 * Form I verbs (au "to precede", ia "to return", uu "to be old"). They are
 * returned as separate entries rather than collapsed, because picking one
 * arbitrarily is what makes a homograph look like a bāb error.
 */
export function parseArabicVerbs(wikitext) {
  const at = wikitext.indexOf('==Arabic==');
  if (at === -1) return [];
  let section = wikitext.slice(at);
  // Stop at the next language heading, so a Chadian or Egyptian Arabic entry
  // further down the page is not read as Modern Standard Arabic.
  const next = /\n==[A-Z][^=\n]*==\n/.exec(section.slice(10));
  if (next) section = section.slice(0, 10 + next.index);

  const lines = section.split('\n');
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /\{\{ar-verb\|([^}]*)\}\}(.*)/.exec(lines[i]);
    if (!m) continue;
    const head = m[1].split('|')[0].trim();
    // The spec is "<roman>", then optionally "/<vowels>" (Form I only, where
    // the bāb must be stated), then dot-separated modifiers:
    //   I/a~u.pass.vn:…    VIII.pass    II
    // so the numeral ends at the first "/" OR ".", not just "/".
    const fm = /^([IVX]+)(?=$|[/.])/.exec(head);
    if (!fm || !ROMAN.includes(fm[1])) continue;

    const afterSlash = head.includes('/') ? head.slice(head.indexOf('/') + 1) : '';
    const babMatch = /([aui])~([aui])/.exec(afterSlash);
    const vn = /vn:([^.|]+)/.exec(head);

    const labels = new Set();
    for (const l of m[2].matchAll(/\{\{tlb\|ar\|([^}]*)\}\}/g)) {
      l[1].split('|').forEach((x) => labels.add(x));
    }
    const glosses = [];
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j];
      if (l.startsWith('{{ar-verb') || l.startsWith('===') || l.startsWith('{{ar-pr')) break;
      if (!l.startsWith('# ')) continue;
      for (const lb of l.matchAll(/\{\{lb\|ar\|([^}]*)\}\}/g)) {
        lb[1].split('|').forEach((x) => labels.add(x));
      }
      const g = l.slice(2).replace(/\{\{[^}]*\}\}/g, '').replace(/\[\[|\]\]/g, '')
        .replace(/\s+/g, ' ').replace(/^[\s,;]+|[\s,;]+$/g, '');
      if (g) glosses.push(g);
    }

    // "ditransitive" and "transitive" both mean a direct object exists, so both
    // license the majhūl. Only an explicit "intransitive" rules it out. No
    // label at all stays null — "Wiktionary does not say", never a guess.
    const trans = labels.has('transitive') || labels.has('ditransitive') ? true
      : labels.has('intransitive') ? false
        : null;

    found.push({
      form: fm[1],
      bab: babMatch ? babMatch[1] + babMatch[2] : null,
      passive: head.includes('.pass'),
      trans,
      labels: [...labels].sort(),
      masdar: vn ? vn[1].split(',').map((s) => s.trim()) : null,
      glosses,
    });
  }
  return found;
}

/**
 * Everything Wiktionary attests for one root, as { form: [sense, …] }.
 * Senses keep their source page so a disagreement can be checked by hand.
 */
export async function probeRoot(radicals) {
  const titles = await rootTerms(radicals);
  if (titles.length === 0) return { root: radicals.join(''), found: false, forms: {} };
  const texts = await pagesWikitext(titles);
  const forms = {};
  for (const [title, wt] of texts) {
    for (const v of parseArabicVerbs(wt)) {
      (forms[v.form] ??= []).push({ ...v, page: title });
    }
  }
  return { root: radicals.join(''), found: true, termCount: titles.length, forms };
}
