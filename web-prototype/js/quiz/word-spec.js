// The identity of one generated word: its coordinates, flat and serialisable.
//
// This is what a stored answer carries forever, so every field is a KEY rather
// than a reference — `rootKey` not a Root, `verbType` copied not looked up. A
// record written today must still say what it asked after the lexicon is
// edited, a root is removed, or an engine is corrected.
//
// A WordSpec is a ChartSpec's AXES plus the ṣīghah plus the two lexical facts
// stats slice by. chart-spec.js deliberately owns only the chart and knows
// nothing about a ṣīghah; this is where the two meet, which is why the type
// lives on the quiz side rather than beside ChartSpec.
//
// What is NOT here is the generated word. A WordSpec is coordinates — two
// questions about the same word share one — and the word itself lives wherever
// the question puts it: in `prompt` when the word is shown (identify, derived)
// or in `response` when it is the answer (produce, fromMeaning). Type 4 is
// type 1 run backwards, and which side the word sits on is the domain fact.
//
// Called by: every question builder (through question.js), history/store.js
// (which spreads it into the flat query index), and tipsFor().

/**
 * Build an identity. `root` is a lexicon entry; everything else is optional
 * because different question kinds pin different axes:
 *
 *   · a verb question pins tense/voice/mood/slot
 *   · a derived-noun question pins derivedKind and leaves the chart axes null
 *   · the bāb question pins neither — it shows a citation, which is two words
 *     in two tenses, so no single chart or ṣīghah names it
 *
 * Every null here means "this axis does not apply to this question", and a
 * reader of a stored record can tell that from the shape.
 */
export function wordSpec({
  root, formId,
  tense = null, voice = null, mood = null,
  slot = null, derivedKind = null,
}) {
  return Object.freeze({
    rootKey: root.root.join(''),
    formId,
    // Granular, always — 'ajwaf_waw', never 'ajwaf'. Folded to a display group
    // only in the view, so stats can later show that a user is fine on
    // hollow-wāw and lost on hollow-yāʾ (A1a · Q9).
    verbType: root.type,
    // A lexical fact about this root's use of this form, copied at ask-time
    // rather than looked up later: the lexicon is mutable and a correction to a
    // root's bāb must not silently rewrite what old records mean (A1a · F4).
    // null for the mazīd forms, which have no bāb.
    bab: root.forms[formId]?.bab ?? null,
    // Three fields, not one composed key: "majhūl across every tense" is a
    // group-by, not string surgery (A1a · F2, which is why chartKey is gone).
    tense, voice, mood,
    slot,
    derivedKind,
  });
}

/** The identity of one cell of a chart — a ChartSpec plus the ṣīghah it names. */
export const wordSpecOf = (spec, slot) => wordSpec({
  root: spec.root, formId: spec.formId,
  tense: spec.tense, voice: spec.voice, mood: spec.mood,
  slot,
});

/** The identity of one derived noun. No chart axes: a mushtaqq has no ṣīghah. */
export const derivedSpecOf = (root, formId, derivedKind) =>
  wordSpec({ root, formId, derivedKind });
