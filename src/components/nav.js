/**
 * nav.js — Top navigation bar component.
 */

export function renderNav(activePage) {
  const links = [
    { id: 'home',        label: '⌂ Home',        hash: '#/' },
    { id: 'browse',      label: '◎ Browse',       hash: '#/browse' },
    { id: 'collections', label: '▤ Collections',  hash: '#/collections' },
    { id: 'crates',      label: '◈ Crates',       hash: '#/crates' },
  ];

  const mount = document.getElementById('nav-mount');
  if (!mount) return;

  mount.innerHTML = `
    <nav class="nav">
      <a class="nav__logo" href="#/">GFlow</a>
      <div class="nav__links">
        ${links.map(l => `
          <a class="nav__link${activePage === l.id ? ' active' : ''}" href="${l.hash}">${l.label}</a>
        `).join('')}
      </div>
      <div class="nav__search">
        <span class="nav__search-icon">🔍</span>
        <input type="text" id="global-search" placeholder="Quick search…" autocomplete="off" />
      </div>
    </nav>
  `;

  // Global search redirects to browse page with query
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.hash = `#/browse?q=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
}
