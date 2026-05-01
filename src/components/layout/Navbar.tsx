import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Library' },
  { to: '/browse', label: 'Browse' },
  { to: '/collections', label: 'Collections' },
  { to: '/crates', label: 'Crates' },
];

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-8">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-black tracking-tight text-white">
            g<span className="text-purple-400">flow</span>
          </span>
          <span className="text-xs text-gray-500 font-medium hidden sm:block">SOUND CATALOGUE</span>
        </NavLink>

        <div className="flex items-center gap-1 ml-auto">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
