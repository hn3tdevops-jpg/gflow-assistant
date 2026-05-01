/**
 * player.js — Bottom audio player bar component.
 * Manages a single HTMLAudioElement and renders a fixed player bar.
 */

let audio = null;
let currentSound = null;
let isPlaying = false;

// Callbacks so other parts of the app can react
const listeners = new Set();
export function onPlayerChange(fn) { listeners.add(fn); }
function notify() { listeners.forEach(fn => fn({ sound: currentSound, playing: isPlaying })); }

function getAudio() {
  if (!audio) {
    audio = new Audio();
    audio.addEventListener('timeupdate',  () => updateProgress());
    audio.addEventListener('ended',      () => { isPlaying = false; notify(); updatePlayBtn(); });
    audio.addEventListener('play',       () => { isPlaying = true;  notify(); updatePlayBtn(); });
    audio.addEventListener('pause',      () => { isPlaying = false; notify(); updatePlayBtn(); });
    audio.addEventListener('loadstart',  () => setState('loading'));
    audio.addEventListener('canplay',    () => setState(''));
    audio.addEventListener('error',      () => setState('error'));
  }
  return audio;
}

export function playSound(sound) {
  const a = getAudio();
  const src = sound.preview_path || sound.file_path || '';
  if (!src) {
    setState('no preview');
    currentSound = sound;
    renderBar();
    return;
  }
  currentSound = sound;
  a.src = src;
  a.play().catch(() => setState('error'));
  renderBar();
}

export function togglePlay() {
  const a = getAudio();
  if (!currentSound) return;
  if (a.paused) a.play().catch(() => setState('error'));
  else a.pause();
}

export function isCurrentSound(id) {
  return currentSound && currentSound.id === id;
}
export function isCurrentlyPlaying() { return isPlaying; }

// ── Render ─────────────────────────────────────────────────
export function initPlayer() {
  const mount = document.getElementById('player-mount');
  if (!mount) return;

  mount.innerHTML = `
    <div class="player-bar player-bar--hidden" id="player-bar">
      <div class="player-bar__info">
        <div class="player-bar__title" id="pb-title">—</div>
        <div class="player-bar__type"  id="pb-type"></div>
      </div>
      <div class="player-bar__controls">
        <button class="player-ctrl-btn player-ctrl-btn--play" id="pb-play-btn" title="Play / Pause">▶</button>
      </div>
      <div class="player-bar__progress">
        <span class="player-bar__time" id="pb-time">0:00</span>
        <div class="progress-track" id="pb-track">
          <div class="progress-fill" id="pb-fill" style="width:0%"></div>
        </div>
        <span class="player-bar__time player-bar__time--end" id="pb-duration">--</span>
      </div>
      <div class="player-bar__volume">
        <span class="player-vol-icon">🔊</span>
        <input type="range" class="vol-slider" id="pb-vol" min="0" max="1" step="0.02" value="1" />
      </div>
      <div class="player-bar__state" id="pb-state"></div>
    </div>
  `;

  document.getElementById('pb-play-btn').addEventListener('click', togglePlay);

  document.getElementById('pb-vol').addEventListener('input', e => {
    if (audio) audio.volume = parseFloat(e.target.value);
  });

  document.getElementById('pb-track').addEventListener('click', e => {
    const a = getAudio();
    if (!a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = ratio * a.duration;
    updateProgress();
  });
}

function renderBar() {
  const bar = document.getElementById('player-bar');
  if (!bar || !currentSound) return;

  bar.classList.remove('player-bar--hidden');
  bar.classList.add('player-bar--visible');

  document.getElementById('pb-title').textContent = currentSound.title || 'Unknown';
  document.getElementById('pb-type').textContent  = [currentSound.type, currentSound.category].filter(Boolean).join(' · ');
  const a = getAudio();
  document.getElementById('pb-duration').textContent = currentSound.duration_seconds
    ? formatTime(currentSound.duration_seconds) : '--';
  updatePlayBtn();
}

function updateProgress() {
  const a = getAudio();
  if (!a.duration) return;
  const pct = (a.currentTime / a.duration) * 100;
  const fill = document.getElementById('pb-fill');
  const time = document.getElementById('pb-time');
  const dur  = document.getElementById('pb-duration');
  if (fill) fill.style.width = pct + '%';
  if (time) time.textContent = formatTime(a.currentTime);
  if (dur && a.duration)  dur.textContent  = formatTime(a.duration);
}

function updatePlayBtn() {
  const btn = document.getElementById('pb-play-btn');
  if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
}

function setState(msg) {
  const el = document.getElementById('pb-state');
  if (!el) return;
  el.textContent = msg;
  el.className = 'player-bar__state' + (msg === 'error' ? ' player-bar__state--error'
    : msg === 'loading' ? ' player-bar__state--loading' : '');
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
