import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const items = [
    { path: '/',               label: 'Inicio',      icon: '🏠' },
    { path: '/nueva-venta',    label: 'Venta',       icon: '🛒' },
    { path: '/consultar-ventas', label: 'Ventas',    icon: '📋' },
    { path: '/cierre-caja',    label: 'Cierre',      icon: '💰' },
    ...(user?.rol === 'admin' ? [
      { path: '/productos',    label: 'Productos',   icon: '📦' },
      { path: '/reportes',     label: 'Reportes',    icon: '📊' }
    ] : [])
  ]

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-brand">🥖 <span>Panadería</span></div>
        <div className="navbar-links desktop-links">
          {items.map(i => (
            <Link key={i.path} to={i.path} className={`nav-link ${location.pathname === i.path ? 'active' : ''}`}>
              {i.icon} {i.label}
            </Link>
          ))}
        </div>
        <div className="navbar-user">
          <span>👤 {user?.nombre}</span>
          <small>{user?.puesto}</small>
          <button onClick={handleLogout} className="btn-logout">Salir</button>
        </div>
      </nav>

      {/* ── MOBILE TOP BAR ── */}
      <header className="mobile-topbar">
        <div className="mobile-brand">🥖 <span>Panadería</span></div>
        <div className="mobile-user-info">
          <span className="mobile-username">{user?.nombre}</span>
          <button onClick={handleLogout} className="mobile-logout-btn">⏻</button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {items.map(i => (
          <Link
            key={i.path}
            to={i.path}
            className={`mobile-nav-item ${location.pathname === i.path ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{i.icon}</span>
            <span className="mobile-nav-label">{i.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

export default Navbar