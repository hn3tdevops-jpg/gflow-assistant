export interface NavItem {
  to: string;
  label: string;
}

export const desktopNavGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Studio',
    items: [
      { to: '/', label: 'Dashboard' },
      { to: '/lyrics', label: 'Lyrics' },
      { to: '/projects', label: 'Projects' },
      { to: '/tools/import-lyrics', label: 'Tools' },
    ],
  },
  {
    title: 'Library',
    items: [
      { to: '/browse', label: 'Browse' },
      { to: '/collections', label: 'Collections' },
      { to: '/crates', label: 'Crates' },
    ],
  },
];

export const mobilePrimaryNav: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/lyrics', label: 'Lyrics' },
  { to: '/projects', label: 'Projects' },
  { to: '/tools/import-lyrics', label: 'Tools' },
  { to: '/settings', label: 'Account' },
];

export const secondaryNav: NavItem[] = [
  { to: '/lyrics/new', label: 'New Lyric' },
  { to: '/lyrics/favorites', label: 'Favorites' },
  { to: '/lyrics/archived', label: 'Archived' },
  { to: '/tools/export-lyrics', label: 'Export Lyrics' },
  { to: '/dictionary', label: 'Dictionary' },
];
