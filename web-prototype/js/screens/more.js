// More — settings, and the way in to the detailed stats page.
//
// The Settings rows are generated from SETTINGS_SPEC's `user` entries rather
// than hand-listed, which is what the audience field is for: adding a user
// preference is one row in that table, and promoting a dev lever is a field edit.

import { el, rowNav } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { settings, setSetting, userSettings, SETTINGS_SPEC } from '../settings/settings.js';
import { deleteAll } from '../history/store.js';
import { basicSummary } from '../history/queries.js';

export function renderMore(app, { rerender }) {
  app.append(el('<h1>More</h1>'));

  app.append(el('<div class="section-label">Progress</div>'));
  const stats = rowNav('Detailed stats', 'By category, form and verb type · trends',
    settings.detailedStats ? undefined : 'SOON');
  stats.onclick = () => { state.showStats = true; rerender(); };
  app.append(stats);

  app.append(el('<div class="section-label">Study</div>'));
  for (const s of userSettings()) {
    app.append(rowNav(s.label, String(settings[s.id])));
  }

  app.append(el('<div class="section-label">App</div>'));
  app.append(rowNav('Privacy policy'));

  // We keep every answer for every user, so we owe them a way to be rid of it.
  const summary = basicSummary();
  const wipe = rowNav('Delete my history',
    summary.hasHistory ? `${summary.total} answers stored on this device` : 'Nothing stored yet');
  wipe.classList.add('danger');
  wipe.onclick = () => {
    if (!summary.hasHistory) return;
    if (confirm(`Delete all ${summary.total} stored answers? This cannot be undone.`)) {
      deleteAll();
      rerender();
    }
  };
  app.append(wipe);

  // A developer surface, not a product one: the dev levers, listed so a feature
  // can be turned on for a look without an edit-and-reload.
  app.append(el('<div class="section-label">Developer</div>'));
  for (const s of SETTINGS_SPEC.filter((x) => x.audience === 'dev')) {
    const row = rowNav(s.label, s.note, settings[s.id] ? 'ON' : undefined);
    row.onclick = () => { setSetting(s.id, !settings[s.id]); rerender(); };
    app.append(row);
  }
}
