/**
 * crates.js — Crates / Favorites page.
 */

import { loadCatalogue } from '../utils/catalogue.js';
import {
  getCrates, createCrate, deleteCrate, renameCrate,
  removeSoundFromCrate, getFavorites,
} from '../utils/storage.js';
import { soundCardHTML, attachCardListeners } from '../components/soundCard.js';

let _activeCrateId = null;
let _sounds        = [];

export async function renderCrates(mount) {
  _sounds = await loadCatalogue();
  window.__catalogue = _sounds;
  drawPage(mount);
}

function drawPage(mount) {
  const crates    = getCrates();
  const favIds    = getFavorites();
  const favSounds = _sounds.filter(s => favIds.includes(s.id));

  _activeCrateId = _activeCrateId || (crates[0]?.id ?? 'favorites');

  const activeIsFav  = _activeCrateId === 'favorites';
  const activeCrate  = crates.find(c => c.id === _activeCrateId);
  const activeSounds = activeIsFav
    ? favSounds
    : activeCrate
      ? _sounds.filter(s => (activeCrate.soundIds || []).includes(s.id))
      : [];

  mount.innerHTML = `
    <div class="page">
      <div class="page__header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h1 class="page__title">Crates</h1>
            <p class="page__subtitle">Group sounds into production crates and manage favorites.</p>
          </div>
          <button class="btn btn--primary" id="new-crate-btn">+ New crate</button>
        </div>
      </div>

      <div class="crates-layout">
        <!-- Crate list sidebar -->
        <div class="crates-list">
          <div class="crates-list__header">
            <span class="crates-list__title">My Crates</span>
          </div>

          <!-- Favorites built-in crate -->
          <div class="crate-item${activeIsFav ? ' active' : ''}" data-crate-id="favorites">
            <span>♥ Favorites</span>
            <span class="crate-item__count">${favIds.length}</span>
          </div>

          <!-- User crates -->
          ${crates.map(c => `
            <div class="crate-item${_activeCrateId === c.id ? ' active' : ''}" data-crate-id="${c.id}">
              <span>◈ ${escHtml(c.name)}</span>
              <span class="crate-item__count">${(c.soundIds || []).length}</span>
            </div>
          `).join('')}
        </div>

        <!-- Crate content -->
        <div>
          <div class="section-header" style="margin-bottom:1rem">
            <span class="section-title" id="crate-title">
              ${activeIsFav ? '♥ Favorites' : escHtml(activeCrate?.name || '—')}
            </span>
            ${!activeIsFav && activeCrate ? `
              <div style="display:flex;gap:.5rem">
                <button class="btn btn--ghost btn--sm" id="rename-crate-btn">Rename</button>
                <button class="btn btn--danger btn--sm" id="delete-crate-btn">Delete</button>
              </div>
            ` : ''}
          </div>

          ${activeSounds.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state__icon">${activeIsFav ? '♥' : '◈'}</div>
              <div class="empty-state__title">No sounds yet</div>
              <div class="empty-state__sub">
                ${activeIsFav
                  ? 'Heart sounds in the browse page to add them here.'
                  : 'Add sounds from the browse or detail pages.'}
              </div>
            </div>
          ` : `
            <div class="sounds-grid" id="crate-sounds">
              ${activeSounds.map(s => soundCardHTML(s)).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- New crate modal (hidden) -->
      <div class="modal-backdrop" id="crate-modal" style="display:none">
        <div class="modal">
          <div class="modal__title">Create new crate</div>
          <input class="modal__input" id="crate-name-input" placeholder="Crate name…" maxlength="60" />
          <div class="modal__actions">
            <button class="btn btn--ghost" id="modal-cancel">Cancel</button>
            <button class="btn btn--primary" id="modal-create">Create</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // New crate button
  document.getElementById('new-crate-btn').addEventListener('click', () => {
    document.getElementById('crate-modal').style.display = 'flex';
    document.getElementById('crate-name-input').focus();
  });

  // Modal
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-create').addEventListener('click', () => {
    const name = document.getElementById('crate-name-input').value.trim();
    if (!name) return;
    const crate = createCrate(name);
    _activeCrateId = crate.id;
    closeModal();
    drawPage(mount);
  });
  document.getElementById('crate-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('modal-create').click();
    if (e.key === 'Escape') closeModal();
  });

  // Crate list item clicks
  mount.querySelectorAll('[data-crate-id]').forEach(el => {
    if (el.classList.contains('crate-item')) {
      el.addEventListener('click', () => {
        _activeCrateId = el.dataset.crateId;
        drawPage(mount);
      });
    }
  });

  // Rename
  const renameBtn = document.getElementById('rename-crate-btn');
  if (renameBtn && activeCrate) {
    renameBtn.addEventListener('click', () => {
      const newName = prompt('Rename crate:', activeCrate.name);
      if (newName && newName.trim()) {
        renameCrate(activeCrate.id, newName.trim());
        drawPage(mount);
      }
    });
  }

  // Delete
  const deleteBtn = document.getElementById('delete-crate-btn');
  if (deleteBtn && activeCrate) {
    deleteBtn.addEventListener('click', () => {
      if (!confirm(`Delete crate "${activeCrate.name}"?`)) return;
      deleteCrate(activeCrate.id);
      _activeCrateId = 'favorites';
      drawPage(mount);
    });
  }

  // Sound cards
  const crateContainer = document.getElementById('crate-sounds');
  if (crateContainer) {
    attachCardListeners(crateContainer, id => { window.location.hash = `#/detail/${id}`; });

    // Remove-from-crate for non-favorites
    if (!activeIsFav && activeCrate) {
      // Hijack card click with right-click ctx later; for now provide a note
    }
  }
}

function closeModal() {
  const modal = document.getElementById('crate-modal');
  if (modal) modal.style.display = 'none';
  const inp = document.getElementById('crate-name-input');
  if (inp) inp.value = '';
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
