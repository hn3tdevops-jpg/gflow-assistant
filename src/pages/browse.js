/**
 * browse.js — Browse / Search page with filters.
 */

import { loadCatalogue, applyFilters } from '../utils/catalogue.js';
import { getFavorites } from '../utils/storage.js';
import { renderFilters } from '../components/filters.js';
import { soundCardHTML, attachCardListeners } from '../components/soundCard.js';

let _filters = {};
let _view    = 'grid'; // 'grid' | 'list'
let _sounds  = [];

export async function renderBrowse(mount, params) {
  mount.innerHTML = `<div class="page"><div class="loading-spinner"></div></div>`;
  _sounds = await loadCatalogue();
  window.__catalogue = _sounds;

  // initialise filters from URL params
  _filters = {
    query:        params.get('q')    || '',
    type:         params.get('type') || '',
    category:     '',
    tags:         [],
    key:          '',
    bpmMin:       '',
    bpmMax:       '',
    license:      '',
    favoritesOnly: false,
  };

  mount.innerHTML = `
    <div class="page">
      <div class="page__header">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem">
          <div>
            <h1 class="page__title">Browse Sounds</h1>
            <p class="page__subtitle">Search and filter your entire library.</p>
          </div>
          <div style="display:flex;gap:.75rem;align-items:center">
            <!-- Search bar -->
            <div class="nav__search" style="width:260px">
              <span class="nav__search-icon">🔍</span>
              <input type="text" id="browse-search" placeholder="Search sounds…"
                     value="${escHtml(_filters.query)}" autocomplete="off" />
            </div>
            <!-- View toggle -->
            <div class="view-toggle">
              <button class="view-toggle-btn${_view === 'grid' ? ' active' : ''}" data-view="grid" title="Grid">⊞</button>
              <button class="view-toggle-btn${_view === 'list' ? ' active' : ''}" data-view="list" title="List">☰</button>
            </div>
          </div>
        </div>
      </div>

      <div class="browse-layout">
        <!-- Sidebar -->
        <div class="filters-sidebar" id="filters-sidebar"></div>

        <!-- Results -->
        <div>
          <div class="result-count" id="result-count"></div>
          <div id="sounds-container"></div>
        </div>
      </div>
    </div>
  `;

  // render filters
  const sidebar = document.getElementById('filters-sidebar');
  renderFilters(sidebar, _sounds, _filters, newFilters => {
    _filters = newFilters;
    updateResults();
    // re-render sidebar to reflect active states
    renderFilters(sidebar, _sounds, _filters, f => { _filters = f; updateResults(); renderFilters(sidebar, _sounds, _filters, () => {}); });
  });

  // search box
  const searchBox = document.getElementById('browse-search');
  searchBox.addEventListener('input', () => {
    _filters.query = searchBox.value;
    updateResults();
  });

  // view toggle
  mount.addEventListener('click', e => {
    const vBtn = e.target.closest('[data-view]');
    if (vBtn) {
      _view = vBtn.dataset.view;
      mount.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === _view));
      updateResults();
    }
  });

  updateResults();
}

function updateResults() {
  const filtered = applyFilters(_sounds, _filters, getFavorites());
  const count    = document.getElementById('result-count');
  const container = document.getElementById('sounds-container');
  if (!container) return;

  if (count) count.textContent = `${filtered.length} sound${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div style="font-size:2rem;margin-bottom:.5rem">🔇</div>
        <div>No sounds match your filters.</div>
      </div>`;
    return;
  }

  container.className = _view === 'list' ? 'sounds-list' : 'sounds-grid';
  container.innerHTML = filtered.map(s => soundCardHTML(s, { listView: _view === 'list' })).join('');

  attachCardListeners(container, id => { window.location.hash = `#/detail/${id}`; });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
