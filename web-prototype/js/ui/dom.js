// DOM helpers shared by every screen. No sarf logic and no app state — this
// file knows how to build an element and nothing about what is in it.

/** Build one element from an HTML string. */
export const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

/**
 * A row of selectable chips. `isOn` and `onPick` carry the selection semantics,
 * so the same row serves single-select (Tables' chart pickers) and multi-select
 * (Practice's axis rows) without knowing which it is.
 *
 * A disabled row greys out rather than disappearing: a row that does not apply
 * to the current selection — voice for the amr, iʿrāb outside the muḍāriʿ —
 * should say so rather than lie about what it filters.
 */
export function chipRow(items, isOn, onPick, { disabled = false, onChange } = {}) {
  const chips = el(`<div class="chips ${disabled ? 'chips-off' : ''}"></div>`);
  for (const { value, label, ar, sub } of items) {
    const chip = el(`<button class="chip ${isOn(value) ? 'on' : ''}" ${disabled ? 'disabled' : ''}>
      ${label}${ar ? `<span class="ar">${ar}</span>` : ''}${sub ? `<small>${sub}</small>` : ''}
    </button>`);
    if (!disabled) chip.onclick = () => { onPick(value); onChange?.(); };
    chips.append(chip);
  }
  return chips;
}

/** Toggle a value in an array, in place. */
export function toggle(arr, val) {
  const i = arr.indexOf(val);
  if (i >= 0) arr.splice(i, 1); else arr.push(val);
}

/**
 * A one-of-N switch. Sibling of chipRow(), NOT a variant of it: a chip row is a
 * multi-select filter over a domain axis, and this is a single setting taking
 * one of a fixed set of values. They should not look alike, because tapping one
 * adds to a selection and tapping the other replaces it.
 *
 * Called by: screens/more.js, for any user setting whose SETTINGS_SPEC entry
 * declares `options`.
 */
export function segmented(options, isOn, onPick, { onChange } = {}) {
  const seg = el('<div class="seg"></div>');
  for (const { value, label } of options) {
    const btn = el(`<button class="${isOn(value) ? 'on' : ''}">${label}</button>`);
    btn.onclick = () => { onPick(value); onChange?.(); };
    seg.append(btn);
  }
  return seg;
}

export function rowNav(title, sub, badge) {
  return el(`<button class="row-nav">
    <span><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>
    ${badge ? `<span class="${badge === 'PRO' ? 'lock' : 'badge-up'}">${badge}</span>`
    : '<span class="chev">›</span>'}
  </button>`);
}

export const chipHtml = (c) =>
  `<span>${c.en ?? ''}${c.ar ? `<span class="ar">${c.ar}</span>` : ''}</span>`;

export function sectionLabel(text, { off = false, note } = {}) {
  return el(`<div class="section-label ${off ? 'off' : ''}">${text}${note ? ` <small>${note}</small>` : ''}</div>`);
}
