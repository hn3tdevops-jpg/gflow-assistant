/**
 * home.js — Library Home page.
 */

import { loadCatalogue, uniqueValues } from '../utils/catalogue.js';
import { getFavorites } from '../utils/storage.js';
import { soundCardHTML, attachCardListeners } from '../components/soundCard.js';

export async function renderHome(mount) {
  mount.innerHTML = `<div class="page"><div class="loading-spinner"></div></div>`;
  const sounds = await loadCatalogue();
  window.__catalogue = sounds;

  const favCount   = getFavorites().length;
  const types      = uniqueValues(sounds, 'type');
  const categories = uniqueValues(sounds, 'category');
  const recent     = sounds.slice(0, 8);

  mount.innerHTML = `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Sound Library</h1>
        <p class="page__subtitle">Browse, audition, and organise your production sounds.</p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__num">${sounds.length}</div>
          <div class="stat-card__label">Total sounds</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__num">${types.length}</div>
          <div class="stat-card__label">Item types</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__num">${categories.length}</div>
          <div class="stat-card__label">Categories</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__num">${favCount}</div>
          <div class="stat-card__label">Favorites</div>
        </div>
      </div>

      <!-- Quick type links -->
      <div class="section-header">
        <span class="section-title">Browse by type</span>
        <a class="section-link" href="#/browse">View all →</a>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem">
        ${types.map(t => `
          <a class="filter-btn" href="#/browse?type=${encodeURIComponent(t)}">${t}</a>
        `).join('')}
      </div>

      <!-- Recent / Featured -->
      <div class="section-header">
        <span class="section-title">Recently added</span>
        <a class="section-link" href="#/browse">See all →</a>
      </div>
      <div class="sounds-grid" id="recent-sounds">
        ${recent.map(s => soundCardHTML(s)).join('')}
      </div>
    </div>
  `;

  attachCardListeners(
    document.getElementById('recent-sounds'),
    id => { window.location.hash = `#/detail/${id}`; }
  );
}
