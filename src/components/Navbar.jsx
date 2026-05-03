import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Store, ShoppingCart, FileText, Banknote, Package, BarChart3, Home, LogOut } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handleLogout = () => { logout(); navigate('/login') }

  const items = [
    { path: '/nueva-venta',      label: 'Punto de Venta', icon: <ShoppingCart size={20} /> },
    { path: '/consultar-ventas', label: 'Ventas',          icon: <FileText size={20} /> },
    { path: '/cierre-caja',      label: 'Cierre de Caja', icon: <Banknote size={20} /> },
    ...(user?.rol === 'admin' ? [
      { path: '/productos', label: 'Productos',  icon: <Package size={20} /> },
      { path: '/reportes',  label: 'Reportes',   icon: <BarChart3 size={20} /> },
    ] : []),
    { path: '/', label: 'Inicio', icon: <Home size={20} /> },
  ]

  return (
    <>
      {/* ════════════════════ DESKTOP SIDEBAR ════════════════════ */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-emoji"><Store size={28} /></span>
          <div>
            <div className="sidebar-logo-name">Panadería</div>
            <div className="sidebar-logo-sub">El pan de cada día</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {items.map(i => (
            <Link
              key={i.path}
              to={i.path}
              className={`sidebar-link ${location.pathname === i.path ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{i.icon}</span>
              <span className="sidebar-link-label">{i.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer: user + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.nombre?.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nombre}</div>
              <div className="sidebar-user-role">{user?.puesto || user?.rol}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ════════════════════ MOBILE TOP BAR ════════════════════ */}
      <header className="mobile-topbar">
        <div className="mobile-brand"><Store size={20} style={{marginRight: '8px'}} /> <span>Panadería</span></div>
        <div className="mobile-user-info">
          <span className="mobile-username">{user?.nombre}</span>
          <button onClick={handleLogout} className="mobile-logout-btn"><LogOut size={18} /></button>
        </div>
      </header>

      {/* ════════════════════ MOBILE BOTTOM NAV ════════════════════ */}
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