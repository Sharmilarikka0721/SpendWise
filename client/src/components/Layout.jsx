import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useAuth } from '../lib/auth.jsx';

const items = [
  { to: '/', icon: 'home', label: 'Home', end: true },
  { to: '/transactions', icon: 'list', label: 'Activity', desktopOnly: true },
  { to: '/analytics', icon: 'chart', label: 'Analytics' },
  { to: '/budget', icon: 'wallet', label: 'Budget' },
  { to: '/learn', icon: 'book', label: 'Learn' },
  { to: '/settings', icon: 'gear', label: 'Settings', desktopOnly: true }
];

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const left = items.filter((i) => !i.desktopOnly).slice(0, 2);
  const right = items.filter((i) => !i.desktopOnly).slice(2);

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand"><span className="coin">🪙</span> SpendWise</Link>
        <nav aria-label="Main">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className="side-link">
              <Icon name={i.icon} /> {i.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/pay" className="btn btn-primary side-pay"><Icon name="scan" size={20} /> Scan &amp; pay</Link>
      </aside>

      <div className="main">
        <header className="topbar">
          <Link to="/" className="brand brand-mobile"><span className="coin">🪙</span> SpendWise</Link>
          <div className="topbar-right">
            <Link to="/transactions" className="icon-btn" aria-label="Activity"><Icon name="list" size={20} /></Link>
            <Link to="/settings" className="avatar" aria-label="Settings">{initials}</Link>
          </div>
        </header>
        <main className="page" key={pathname}><Outlet /></main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {left.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className="tab"><Icon name={i.icon} /><span>{i.label}</span></NavLink>
        ))}
        <Link to="/pay" className="fab" aria-label="Scan and pay"><Icon name="scan" size={26} /></Link>
        {right.map((i) => (
          <NavLink key={i.to} to={i.to} className="tab"><Icon name={i.icon} /><span>{i.label}</span></NavLink>
        ))}
      </nav>
    </div>
  );
}
