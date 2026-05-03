import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { ShoppingCart, FileText, Banknote, Package, BarChart3, Users, Flame, ShieldAlert } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [topProducts, setTopProducts] = useState([])
  const [roboHormiga, setRoboHormiga] = useState([])

  useEffect(() => {
    if (user?.rol === 'admin') {
      const d = new Date()
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      const today = d.toISOString().split('T')[0]
      api.get(`/reportes/productos-top?fecha=${today}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => setTopProducts(res.data))
        .catch(console.error)

      api.get('/reportes/robo-hormiga', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => setRoboHormiga(res.data))
        .catch(console.error)
    }
  }, [user])

  const menu = [
    { path: '/nueva-venta', icon: <ShoppingCart size={28} />, label: 'Nueva Venta', desc: 'Registrar venta al cliente', color: 'green' },
    { path: '/consultar-ventas', icon: <FileText size={28} />, label: 'Consultar Ventas', desc: 'Historial de ventas del día', color: 'blue' },
    { path: '/cierre-caja', icon: <Banknote size={28} />, label: 'Cierre de Caja', desc: 'Cierre diario de caja', color: 'orange' },
    ...(user?.rol === 'admin' ? [
      { path: '/productos', icon: <Package size={28} />, label: 'Productos', desc: 'Gestionar catálogo', color: 'purple' },
      { path: '/reportes', icon: <BarChart3 size={28} />, label: 'Reportes', desc: 'Estadísticas y análisis', color: 'red' },
      { path: '/usuarios', icon: <Users size={28} />, label: 'Trabajadores', desc: 'Administrar puestos', color: 'gray' },
    ] : [])
  ]

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="dashboard">
          <div className="dashboard-welcome">
            <h1>Bienvenido, {user?.nombre}</h1>
            <p>{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Puesto: <strong>{user?.puesto}</strong></p>
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

          {user?.rol === 'admin' && (
            <div className="dashboard-widgets">
              <div className="widget-card top-products-widget">
                <div className="widget-header">
                  <h3><span className="widget-icon"><Flame size={20} /></span> Productos Más Vendidos Hoy</h3>
                </div>
                <div className="widget-content">
                  {topProducts.length > 0 ? (
                    <ul className="widget-list">
                      {topProducts.map((p, i) => (
                        <li key={i} className="widget-list-item">
                          <span className="item-name">{p.nombre_producto}</span>
                          <span className="item-qty badge-green">{p.total_cantidad} und.</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="widget-empty">No hay ventas registradas hoy.</p>
                  )}
                </div>
              </div>

              <div className="widget-card alerts-widget">
                <div className="widget-header alert-header">
                  <h3><span className="widget-icon"><ShieldAlert size={20} /></span> Alertas de Posible Robo Hormiga</h3>
                  <p className="widget-subtitle">Trabajadores con faltantes recurrentes en caja</p>
                </div>
                <div className="widget-content">
                  {roboHormiga.length > 0 ? (
                    <ul className="widget-list">
                      {roboHormiga.map((r, i) => (
                        <li key={i} className="widget-list-item alert-item">
                          <div className="alert-info">
                            <strong>{r.trabajador}</strong>
                            <span className="alert-count">{r.cantidad_faltantes} faltantes registrados</span>
                          </div>
                          <span className="item-qty badge-red">$ {Math.abs(r.total_faltante).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="widget-empty success">No se detectan faltantes sospechosos.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}