/**
 * collections.js — Collections browse page.
 */

import { loadCatalogue } from '../utils/catalogue.js';
import { soundCardHTML, attachCardListeners } from '../components/soundCard.js';

export async function renderCollections(mount) {
  mount.innerHTML = `<div class="page"><div class="loading-spinner"></div></div>`;
  const sounds = await loadCatalogue();
  window.__catalogue = sounds;

  // Collections are items with type === 'collection', plus we group sounds by category
  const collections = sounds.filter(s => s.type === 'collection');
  const categories  = [...new Set(sounds.map(s => s.category).filter(Boolean))].sort();

  mount.innerHTML = `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Collections</h1>
        <p class="page__subtitle">Curated sound packs and category groupings.</p>
      </div>

      ${collections.length > 0 ? `
        <div class="section-header">
          <span class="section-title">Sound Collections</span>
        </div>
        <div class="collections-grid" id="collections-grid">
          ${collections.map(c => collectionCardHTML(c, sounds)).join('')}
        </div>
        <div style="height:2rem"></div>
      ` : ''}

      <div class="section-header">
        <span class="section-title">Browse by Category</span>
      </div>
      <div class="collections-grid" id="cat-grid">
        ${categories.map(cat => {
          const catSounds = sounds.filter(s => s.category === cat);
          return `
            <div class="collection-card" data-cat="${escHtml(cat)}">
              <div class="collection-card__name">${escHtml(cat)}</div>
              <div class="collection-card__desc">${catSounds.length} sound${catSounds.length !== 1 ? 's' : ''}</div>
              <div class="collection-card__footer">
                <span>${[...new Set(catSounds.map(s => s.type))].join(', ')}</span>
                <span>View all →</span>
              </div>
            </div>`;
        }).join('')}
      </div>

      <!-- Expanded category sounds -->
      <div id="cat-detail" style="margin-top:1.5rem"></div>
    </div>
  `;

  // Collection card click → navigate to detail
  const collGrid = document.getElementById('collections-grid');
  if (collGrid) {
    attachCardListeners(collGrid, id => { window.location.hash = `#/detail/${id}`; });
    collGrid.querySelectorAll('.collection-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (id) window.location.hash = `#/detail/${id}`;
      });
    });
  }

  // Category card click → show sounds in that category
  document.getElementById('cat-grid').addEventListener('click', e => {
    const card = e.target.closest('[data-cat]');
    if (!card) return;
    const cat       = card.dataset.cat;
    const catSounds = sounds.filter(s => s.category === cat);
    const detail    = document.getElementById('cat-detail');

    detail.innerHTML = `
      <div class="section-header">
        <span class="section-title">${escHtml(cat)}</span>
        <a class="section-link" href="#/browse?category=${encodeURIComponent(cat)}">Open in browse →</a>
      </div>
      <div class="sounds-grid" id="cat-sounds">
        ${catSounds.map(s => soundCardHTML(s)).join('')}
      </div>
    `;
    attachCardListeners(document.getElementById('cat-sounds'),
      id => { window.location.hash = `#/detail/${id}`; });
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function collectionCardHTML(coll, allSounds) {
  const members = allSounds.filter(s => (s.tags || []).includes(coll.id) || s.category === coll.category);
  return `
    <div class="collection-card" data-id="${coll.id}">
      <div class="collection-card__name">${escHtml(coll.title)}</div>
      <div class="collection-card__desc">${escHtml(coll.description || '')}</div>
      <div class="collection-card__footer">
        <span>${members.length} items</span>
        <span>${coll.source || ''}</span>
      </div>
    </div>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
