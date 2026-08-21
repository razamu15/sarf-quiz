// Every feature gate in the app, in one table.
//
// ONE OBJECT, TWO AUDIENCES. A flag is either a DEVELOPER LEVER we flip in code,
// or a USER PREFERENCE the Settings screen renders. Reading is audience-blind on
// purpose — `settings.compareCharts` is the same call whichever kind it is, so
// no feature has to know why it is off.
//
// The audience is DECLARED on the entry rather than left to a naming convention,
// because it is the fact the Settings screen actually needs: it renders exactly
// the `user` rows, so promoting a dev lever to a user preference later is a
// field edit rather than a refactor.
//
// Called by:
//   · screens/more.js — renders userSettings() and writes through setSetting()
//   · lexicon-service.js — the two CONTENT gates, read inside availableTypes()
//     so "is this verb type playable" keeps one owner (see the note there)
//   · screens/compare.js, screens/stats.js, the explain sheet — when they land
//
// NOT called by history/store.js, and that file does not import this one. The
// premise of keeping full records for every user is that no flag can reach the
// WRITER: data you didn't keep can't be backfilled, and a gate on the write path
// would quietly destroy that. `detailedStats` gates screens, nothing else.
//
// ---PROTOTYPE ONLY--- persistence is localStorage; on iOS this is UserDefaults.

const KEY = 'sarf.settings.v1';

/**
 * The registry. `default` is what ships; `label` is what the Settings screen
 * shows for the 'user' rows; `note` records why a 'dev' row is off.
 *
 * v1 ships with every dev lever off except compareCharts, which is on for us
 * and off for users — it is the engine-audit instrument (roadmap Q2).
 */
export const SETTINGS_SPEC = [
  { id: 'aiExplain', audience: 'dev', default: false,
    label: 'AI explanations',
    note: 'PRODUCT_SPEC §5.5 — later version; recognition tips fill the slot in v1' },
  { id: 'detailedStats', audience: 'dev', default: false,
    label: 'Detailed stats',
    note: 'gates the SCREENS only — history storage is unconditional' },
  { id: 'compareCharts', audience: 'dev', default: true,
    label: 'Compare charts',
    note: 'PRODUCT_SPEC §5.7 — dev-audience: on for us, not shipped to users in v1' },
  { id: 'monetization', audience: 'dev', default: false,
    label: 'Subscription',
    note: 'PRODUCT_SPEC §4 — no Pro tier in v1' },
  { id: 'mahmuzVerbs', audience: 'dev', default: false,
    label: 'Mahmūz verbs',
    note: 'CONTENT gate — no engine and no roots yet' },
  { id: 'lafifVerbs', audience: 'dev', default: false,
    label: 'Lafīf verbs',
    note: 'CONTENT gate — no engine and no roots yet' },

  { id: 'arabicTextSize', audience: 'user', default: 'large', label: 'Arabic text size' },
  { id: 'appearance', audience: 'user', default: 'system', label: 'Appearance' },
  { id: 'defaultQuizLength', audience: 'user', default: 10, label: 'Default quiz length' },
];

const DEFAULTS = Object.fromEntries(SETTINGS_SPEC.map((s) => [s.id, s.default]));

function loadOverrides() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return {};
    // Only ids the registry knows. A flag deleted from the spec should not keep
    // living in a user's storage and reappear as a phantom setting.
    return Object.fromEntries(
      Object.entries(raw).filter(([id]) => id in DEFAULTS),
    );
  } catch {
    return {};
  }
}

/** The live values. Read as plain properties: `settings.compareCharts`. */
export const settings = { ...DEFAULTS, ...loadOverrides() };

/** Write one setting through. Unknown ids are refused rather than stored. */
export function setSetting(id, value) {
  if (!(id in DEFAULTS)) throw new Error(`settings: unknown id "${id}"`);
  settings[id] = value;
  try {
    const overrides = Object.fromEntries(
      Object.entries(settings).filter(([k, v]) => v !== DEFAULTS[k]),
    );
    localStorage.setItem(KEY, JSON.stringify(overrides));
  } catch {
    // Private mode or quota. The setting still applies for this session.
  }
}

/** The rows the Settings screen renders — exactly the user-facing ones. */
export const userSettings = () => SETTINGS_SPEC.filter((s) => s.audience === 'user');
