import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../useTheme.js';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <NavLink to="/" className="brand">
          SuretySeven <span className="brand-sub">Document Processing</span>
        </NavLink>
        <div className="nav-right">
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Documents
            </NavLink>
            <NavLink to="/upload" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Upload
            </NavLink>
          </nav>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
