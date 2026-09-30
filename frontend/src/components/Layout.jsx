import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const links = [
    ['/', 'Dashboard'],
    ['/patients', 'Patients'],
    ['/appointments', 'Rendez-vous']
  ];

  return (
    <div className="shell">
      <aside>
        <div className="brand">ClinicFlow</div>

        <div className="role">{user?.role}</div>

        <nav>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="logout"
          onClick={() => {
            logout();
            nav('/login');
          }}
        >
          Déconnexion
        </button>
      </aside>

      <main>
        <header>
          <div>
            <strong>Gestion clinique</strong>
            <span>Patients & rendez-vous</span>
          </div>

          <span className="user-email">{user?.email}</span>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}