import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const menu = [
    { path: '/nueva-venta', icon: '🛒', label: 'Nueva Venta', desc: 'Registrar venta al cliente', color: 'green' },
    { path: '/consultar-ventas', icon: '📋', label: 'Consultar Ventas', desc: 'Historial de ventas del día', color: 'blue' },
    { path: '/cierre-caja', icon: '💰', label: 'Cierre de Caja', desc: 'Cierre diario de caja', color: 'orange' },
    ...(user?.rol === 'admin' ? [
      { path: '/productos', icon: '📦', label: 'Productos', desc: 'Gestionar catálogo', color: 'purple' },
      { path: '/reportes', icon: '📊', label: 'Reportes', desc: 'Estadísticas y análisis', color: 'red' },
    ] : [])
  ]

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="dashboard">
          <div className="dashboard-welcome">
            <h1>Bienvenido, {user?.nombre} 👋</h1>
            <p>{new Date().toLocaleDateString('es-PE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} — Puesto: <strong>{user?.puesto}</strong></p>
          </div>
          <div className="menu-grid">
            {menu.map(m => (
              <div key={m.path} className={`menu-card card-${m.color}`} onClick={() => navigate(m.path)}>
                <span className="menu-card-icon">{m.icon}</span>
                <h3>{m.label}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}