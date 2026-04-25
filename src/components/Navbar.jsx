import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const items = [
    { path: '/', label: '🏠 Inicio' },
    { path: '/nueva-venta', label: '🛒 Nueva Venta' },
    { path: '/consultar-ventas', label: '📋 Ventas' },
    { path: '/cierre-caja', label: '💰 Cierre' },
    ...(user?.rol === 'admin' ? [
      { path: '/productos', label: '📦 Productos' },
      { path: '/reportes', label: '📊 Reportes' }
    ] : [])
  ]

  return (
    <nav className="navbar">
      <div className="navbar-brand">🥖 <span>Panadería</span></div>
      <div className="navbar-links">
        {items.map(i => (
          <Link key={i.path} to={i.path} className={`nav-link ${location.pathname === i.path ? 'active' : ''}`}>
            {i.label}
          </Link>
        ))}
      </div>
      <div className="navbar-user">
        <span>👤 {user?.nombre}</span>
        <small>{user?.puesto}</small>
        <button onClick={handleLogout} className="btn-logout">Salir</button>
      </div>
    </nav>
  )
}

export default Navbar