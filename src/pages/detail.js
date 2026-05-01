/**
 * detail.js — Sound Detail page.
 */

import { loadCatalogue, formatDuration, typeBadgeClass } from '../utils/catalogue.js';
import { toggleFavorite, isFavorite, getCrates, addSoundToCrate } from '../utils/storage.js';
import { playSound } from '../components/player.js';

export async function renderDetail(mount, soundId) {
  mount.innerHTML = `<div class="page"><div class="loading-spinner"></div></div>`;
  const sounds = await loadCatalogue();
  window.__catalogue = sounds;
  const sound = sounds.find(s => s.id === soundId);

  if (!sound) {
    mount.innerHTML = `
      <div class="page">
        <div class="empty-state">
          <div class="empty-state__icon">🔇</div>
          <div class="empty-state__title">Sound not found</div>
          <div class="empty-state__sub"><a href="#/browse">← Back to browse</a></div>
        </div>
      </div>`;
    return;
  }

  const fav    = isFavorite(sound.id);
  const crates = getCrates();
  const dur    = formatDuration(sound.duration_seconds);
  const tags   = sound.tags || [];

  mount.innerHTML = `
    <div class="page">
      <!-- Back link -->
      <div style="margin-bottom:1rem">
        <a href="#/browse" style="font-size:.85rem;color:var(--text-muted)">← Back to library</a>
      </div>

      <div class="detail-layout">
        <!-- Main content -->
        <div class="detail-main">
          <div class="detail-meta-row">
            <span class="${typeBadgeClass(sound.type)}">${sound.type || '—'}</span>
            ${sound.category    ? `<span class="tag">${escHtml(sound.category)}</span>` : ''}
            ${sound.subcategory ? `<span class="tag">${escHtml(sound.subcategory)}</span>` : ''}
          </div>

          <h1 class="detail-title">${escHtml(sound.title)}</h1>

          <!-- Player controls -->
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
            <button class="sound-card__play-btn" id="detail-play-btn" style="width:44px;height:44px;font-size:1.1rem"
                    title="Preview">▶</button>
            <button class="sound-card__fav-btn${fav ? ' active' : ''}" id="detail-fav-btn"
                    style="width:36px;height:36px" title="Favorite">♥</button>
            ${crates.length > 0 ? `
              <div style="position:relative">
                <button class="btn btn--ghost btn--sm" id="detail-crate-btn">+ Add to crate</button>
                <div class="crate-dropdown" id="detail-crate-dropdown" style="display:none">
                  ${crates.map(c =>
                    `<div class="crate-dropdown__item" data-crate-id="${c.id}">${escHtml(c.name)}</div>`
                  ).join('')}
                </div>
              </div>
            ` : `<a href="#/crates" class="btn btn--ghost btn--sm">Create a crate</a>`}
          </div>

          <!-- Waveform placeholder -->
          ${buildWaveform(sound)}

          <!-- Description -->
          ${sound.description ? `
            <div class="detail-section">
              <div class="detail-section__title">Description</div>
              <p>${escHtml(sound.description)}</p>
            </div>
          ` : ''}

          <!-- Production Notes -->
          ${sound.production_notes ? `
            <div class="detail-section">
              <div class="detail-section__title">Production Notes</div>
              <div class="detail-notes">${escHtml(sound.production_notes)}</div>
            </div>
          ` : ''}

          <!-- Tags -->
          ${tags.length > 0 ? `
            <div class="detail-section">
              <div class="detail-section__title">Tags</div>
              <div class="tags-list">${tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
            </div>
          ` : ''}
        </div>

        <!-- Sidebar -->
        <div class="detail-sidebar">
          <!-- Technical metadata -->
          <div class="detail-card">
            <div class="detail-card__title">Technical Info</div>
            <table class="meta-table">
              ${row('Duration',    dur)}
              ${row('BPM',         sound.bpm)}
              ${row('Key',         sound.key)}
              ${row('Format',      sound.format)}
              ${row('Sample Rate', sound.sample_rate ? sound.sample_rate + ' Hz' : null)}
              ${row('Bit Depth',   sound.bit_depth   ? sound.bit_depth   + '-bit' : null)}
            </table>
          </div>

          <!-- Source / License -->
          <div class="detail-card" style="margin-top:1rem">
            <div class="detail-card__title">Source & License</div>
            <table class="meta-table">
              ${row('Source',  sound.source)}
              ${row('License', sound.license)}
              ${row('File',    sound.file_path)}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Play button
  document.getElementById('detail-play-btn').addEventListener('click', () => {
    playSound(sound);
  });

  // Favorite button
  const favBtn = document.getElementById('detail-fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const newState = toggleFavorite(sound.id);
      favBtn.classList.toggle('active', newState);
    });
  }

  // Crate dropdown
  const crateBtn = document.getElementById('detail-crate-btn');
  const crateDD  = document.getElementById('detail-crate-dropdown');
  if (crateBtn && crateDD) {
    crateBtn.addEventListener('click', e => {
      e.stopPropagation();
      crateDD.style.display = crateDD.style.display === 'none' ? 'block' : 'none';
    });
    crateDD.addEventListener('click', e => {
      const item = e.target.closest('[data-crate-id]');
      if (item) {
        addSoundToCrate(item.dataset.crateId, sound.id);
        crateDD.style.display = 'none';
      }
    });
    document.addEventListener('click', () => { if (crateDD) crateDD.style.display = 'none'; });
  }
}

function row(label, value) {
  if (!value && value !== 0) return '';
  return `<tr><td>${escHtml(label)}</td><td>${escHtml(String(value))}</td></tr>`;
}

function buildWaveform(sound) {
  if (sound.waveform_path) {
    return `<div class="waveform-placeholder"><img src="${escHtml(sound.waveform_path)}" alt="waveform" style="width:100%;height:100%;object-fit:cover"/></div>`;
  }
  // synthetic placeholder bars
  const bars = Array.from({ length: 60 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin(i * 0.45 + (sound.id.charCodeAt(0) || 0) * 0.1)) * 70;
    return `<div class="waveform-bar" style="height:${h}%"></div>`;
  }).join('');
  return `<div class="waveform-placeholder"><div class="waveform-bars">${bars}</div></div>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
