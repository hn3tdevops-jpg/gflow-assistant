/**
 * soundCard.js — Reusable sound card component.
 */

import { typeBadgeClass, formatDuration } from '../utils/catalogue.js';
import { toggleFavorite, isFavorite, getCrates, addSoundToCrate } from '../utils/storage.js';
import { playSound, isCurrentSound, isCurrentlyPlaying } from './player.js';

/**
 * Build the HTML string for a sound card.
 * @param {Object} sound
 * @param {Object} opts  { listView: boolean }
 */
export function soundCardHTML(sound, opts = {}) {
  const fav     = isFavorite(sound.id);
  const playing = isCurrentSound(sound.id) && isCurrentlyPlaying();

  const bpmStr = sound.bpm ? `${sound.bpm} BPM` : '';
  const keyStr = sound.key ? sound.key : '';
  const dur    = formatDuration(sound.duration_seconds);
  const meta   = [bpmStr, keyStr, dur].filter(Boolean).join(' · ');

  return `
    <div class="sound-card" data-id="${sound.id}">
      <div class="sound-card__header">
        <span class="sound-card__title">${escHtml(sound.title)}</span>
        <button class="sound-card__fav-btn${fav ? ' active' : ''}"
                data-fav="${sound.id}" title="Favorite">♥</button>
      </div>
      <div class="sound-card__meta">
        <span class="${typeBadgeClass(sound.type)}">${sound.type || '—'}</span>
        ${sound.category ? `<span class="tag">${escHtml(sound.category)}</span>` : ''}
        ${(sound.tags || []).slice(0, 3).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}
      </div>
      <div class="sound-card__actions">
        <button class="sound-card__play-btn${playing ? ' playing' : ''}"
                data-play="${sound.id}" title="Preview">
          ${playing ? '⏸' : '▶'}
        </button>
        <div class="sound-card__info">
          <span>${escHtml(sound.category || '')}${sound.subcategory ? ' / ' + escHtml(sound.subcategory) : ''}</span><br/>
          <span class="sound-card__key">${meta}</span>
        </div>
        <div style="position:relative">
          <button class="btn btn--ghost btn--sm" data-crate-menu="${sound.id}" title="Add to crate">+ Crate</button>
        </div>
      </div>
    </div>
  `;
}

/** Attach event listeners to cards inside a container element. */
export function attachCardListeners(container, onNavigate) {
  container.addEventListener('click', e => {
    // Play button
    const playBtn = e.target.closest('[data-play]');
    if (playBtn) {
      e.stopPropagation();
      const id = playBtn.dataset.play;
      const sound = findSoundById(container, id);
      if (sound) playSound(sound);
      return;
    }

    // Favorite button
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      e.stopPropagation();
      const id = favBtn.dataset.fav;
      const newState = toggleFavorite(id);
      favBtn.classList.toggle('active', newState);
      favBtn.title = newState ? 'Unfavorite' : 'Favorite';
      return;
    }

    // Crate menu
    const crateBtn = e.target.closest('[data-crate-menu]');
    if (crateBtn) {
      e.stopPropagation();
      toggleCrateDropdown(crateBtn, crateBtn.dataset.crateMenu);
      return;
    }

    // Crate dropdown item
    const crateItem = e.target.closest('[data-add-to-crate]');
    if (crateItem) {
      e.stopPropagation();
      const { crateId, soundId } = crateItem.dataset;
      addSoundToCrate(crateId, soundId);
      closeCrateDropdowns();
      return;
    }

    // Card click → navigate to detail
    const card = e.target.closest('.sound-card');
    if (card) {
      closeCrateDropdowns();
      const id = card.dataset.id;
      if (id && onNavigate) onNavigate(id);
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', closeCrateDropdowns, { capture: true });
}

function toggleCrateDropdown(btn, soundId) {
  closeCrateDropdowns();
  const crates = getCrates();
  if (!crates.length) {
    window.location.hash = '#/crates';
    return;
  }
  const dropdown = document.createElement('div');
  dropdown.className = 'crate-dropdown';
  dropdown.dataset.crateDropdown = '1';
  dropdown.innerHTML = crates.map(c =>
    `<div class="crate-dropdown__item"
          data-add-to-crate="1"
          data-crate-id="${c.id}"
          data-sound-id="${soundId}">${escHtml(c.name)}</div>`
  ).join('');
  btn.parentElement.appendChild(dropdown);
}

function closeCrateDropdowns() {
  document.querySelectorAll('[data-crate-dropdown]').forEach(el => el.remove());
}

/** Look up cached sound data from a data-attribute on the card. */
function findSoundById(container, id) {
  // Try the module-level cache set by the page
  return window.__catalogue ? window.__catalogue.find(s => s.id === id) : null;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
