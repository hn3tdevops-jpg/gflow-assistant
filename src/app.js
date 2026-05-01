/**
 * app.js — Main application entry point and hash-based router.
 */

import { renderNav }         from './components/nav.js';
import { initPlayer }        from './components/player.js';
import { renderHome }        from './pages/home.js';
import { renderBrowse }      from './pages/browse.js';
import { renderDetail }      from './pages/detail.js';
import { renderCollections } from './pages/collections.js';
import { renderCrates }      from './pages/crates.js';

const mount = document.getElementById('page-mount');

async function route() {
  const hash   = window.location.hash || '#/';
  const [path, qs] = hash.slice(1).split('?');
  const params = new URLSearchParams(qs || '');
  const parts  = path.split('/').filter(Boolean);  // e.g. ['detail', 'id123']

  // Determine active nav page
  let page = 'home';
  if (parts[0] === 'browse')      page = 'browse';
  if (parts[0] === 'collections') page = 'collections';
  if (parts[0] === 'crates')      page = 'crates';
  if (parts[0] === 'detail')      page = 'detail';

  renderNav(page);

  switch (page) {
    case 'browse':      await renderBrowse(mount, params);          break;
    case 'collections': await renderCollections(mount);             break;
    case 'crates':      await renderCrates(mount);                  break;
    case 'detail':      await renderDetail(mount, parts[1] || ''); break;
    default:            await renderHome(mount);
  }
}

// Bootstrap
initPlayer();
window.addEventListener('hashchange', route);
route();
