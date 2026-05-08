import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { desktopNavGroups, mobilePrimaryNav, secondaryNav } from './navConfig';

function navLinkClasses(isActive: boolean) {
  return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-emerald-600 text-white'
      : 'text-gray-300 hover:text-white hover:bg-gray-800'
  }`;
}

export default function Navbar() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <NavLink to="/" className="font-black text-lg tracking-tight text-white shrink-0">
            FGFlow <span className="text-emerald-400">Studio</span>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-6 ml-auto">
            {desktopNavGroups.map((group) => (
              <div key={group.title} className="flex items-center gap-1">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 mr-1">{group.title}</span>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/lyrics' || item.to === '/tools/import-lyrics'}
                    className={({ isActive }) => navLinkClasses(isActive)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
            >
              More
            </button>
          </nav>
        </div>

        {showMore && (
          <div className="hidden lg:block border-t border-gray-800 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-2">
              {secondaryNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navLinkClasses(isActive)}
                  onClick={() => setShowMore(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-5">
          {mobilePrimaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/lyrics' || item.to === '/tools/import-lyrics'}
              className={({ isActive }) =>
                `px-2 py-3 text-center text-xs font-medium ${
                  isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
