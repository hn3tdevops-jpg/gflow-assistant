/**
 * filters.js — Filter sidebar component.
 */

import { uniqueValues } from '../utils/catalogue.js';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
              'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'];

/**
 * Render the filters sidebar into the given element.
 * @param {HTMLElement} el
 * @param {Array}       sounds   — full catalogue for building filter options
 * @param {Object}      filters  — current active filters
 * @param {Function}    onChange — called with new filters object
 */
export function renderFilters(el, sounds, filters, onChange) {
  const types      = uniqueValues(sounds, 'type');
  const categories = uniqueValues(sounds, 'category');
  const allTags    = uniqueValues(sounds, 'tags');
  const licenses   = uniqueValues(sounds, 'license');

  el.innerHTML = `
    <div class="filters-sidebar__title">Filters</div>

    <!-- Type -->
    <div class="filter-group">
      <div class="filter-group__label">Type</div>
      <div>
        ${types.map(t => `
          <button class="filter-btn${filters.type === t ? ' active' : ''}"
                  data-filter="type" data-val="${t}">${t}</button>
        `).join('')}
      </div>
    </div>

    <!-- Category -->
    <div class="filter-group">
      <div class="filter-group__label">Category</div>
      <div>
        ${categories.map(c => `
          <button class="filter-btn${filters.category === c ? ' active' : ''}"
                  data-filter="category" data-val="${c}">${c}</button>
        `).join('')}
      </div>
    </div>

    <!-- Tags -->
    <div class="filter-group">
      <div class="filter-group__label">Tags</div>
      <div>
        ${allTags.slice(0, 30).map(t => `
          <button class="filter-btn${(filters.tags || []).includes(t) ? ' active' : ''}"
                  data-filter="tag" data-val="${t}">${t}</button>
        `).join('')}
      </div>
    </div>

    <!-- Key -->
    <div class="filter-group">
      <div class="filter-group__label">Key</div>
      <select class="filter-input" data-filter="key">
        <option value="">Any key</option>
        ${KEYS.map(k => `<option value="${k}"${filters.key === k ? ' selected' : ''}>${k}</option>`).join('')}
      </select>
    </div>

    <!-- BPM Range -->
    <div class="filter-group">
      <div class="filter-group__label">BPM Range</div>
      <div class="bpm-range">
        <input type="number" class="filter-input" data-filter="bpmMin" placeholder="Min"
               value="${filters.bpmMin || ''}" min="0" max="300" />
        <span>–</span>
        <input type="number" class="filter-input" data-filter="bpmMax" placeholder="Max"
               value="${filters.bpmMax || ''}" min="0" max="300" />
      </div>
    </div>

    <!-- License -->
    <div class="filter-group">
      <div class="filter-group__label">License</div>
      <select class="filter-input" data-filter="license">
        <option value="">Any</option>
        ${licenses.map(l => `<option value="${l}"${filters.license === l ? ' selected' : ''}>${l}</option>`).join('')}
      </select>
    </div>

    <!-- Favorites -->
    <div class="filter-group">
      <div class="filter-group__label">Favorites</div>
      <button class="filter-btn${filters.favoritesOnly ? ' active' : ''}"
              data-filter="favoritesOnly">♥ Show only favorites</button>
    </div>

    <button class="filter-reset-btn" id="filter-reset">✕ Reset filters</button>
  `;

  // Attach events
  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const f = btn.dataset.filter;
    const v = btn.dataset.val;

    if (f === 'type')     onChange({ ...filters, type:     filters.type     === v ? '' : v });
    if (f === 'category') onChange({ ...filters, category: filters.category === v ? '' : v });
    if (f === 'tag') {
      const tags = [...(filters.tags || [])];
      const idx  = tags.indexOf(v);
      if (idx === -1) tags.push(v); else tags.splice(idx, 1);
      onChange({ ...filters, tags });
    }
    if (f === 'favoritesOnly') onChange({ ...filters, favoritesOnly: !filters.favoritesOnly });
  });

  el.addEventListener('change', e => {
    const sel = e.target.closest('[data-filter]');
    if (!sel) return;
    const f = sel.dataset.filter;
    if (f === 'key')     onChange({ ...filters, key:     sel.value });
    if (f === 'license') onChange({ ...filters, license: sel.value });
  });

  el.addEventListener('input', e => {
    const inp = e.target.closest('[data-filter]');
    if (!inp) return;
    const f = inp.dataset.filter;
    if (f === 'bpmMin') onChange({ ...filters, bpmMin: inp.value });
    if (f === 'bpmMax') onChange({ ...filters, bpmMax: inp.value });
  });

  const resetBtn = el.querySelector('#filter-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      onChange({ query: filters.query });
    });
  }
}
