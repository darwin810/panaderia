import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ConsultarVentas() {
  const { user } = useAuth()
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [selected, setSelected] = useState(null)

  const cargar = async () => {
    setLoading(true)
    const params = new URLSearchParams({ fecha })
    if (user.rol !== 'admin') params.append('usuario_id', user.id)
    const { data } = await api.get(`/ventas?${params}`)
    setVentas(data); setLoading(false)
  }

  useEffect(() => { cargar() }, [fecha])

  const totalDia = ventas.reduce((s, v) => s + parseFloat(v.total), 0)

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrap">
          <div className="page-header">
            <h2>📋 Consultar Ventas</h2>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input-date" />
          </div>

          <div className="stats-row">
            <div className="stat-box"><span className="stat-num">{ventas.length}</span><span className="stat-lbl">Ventas</span></div>
            <div className="stat-box highlight"><span className="stat-num">S/ {totalDia.toFixed(2)}</span><span className="stat-lbl">Total del día</span></div>
          </div>

          {loading ? <div className="loading">Cargando...</div> : (
            <div className="table-wrap">
              <table className="tabla">
                <thead>
                  <tr><th>ID</th><th>Hora</th><th>Trabajador</th><th>Puesto</th><th>Total</th><th>Boleta</th><th></th></tr>
                </thead>
                <tbody>
                  {ventas.map(v => (
                    <tr key={v.id}>
                      <td>#{v.id}</td>
                      <td>{new Date(v.fecha_hora).toLocaleTimeString('es-PE')}</td>
                      <td>{v.trabajador_nombre}</td>
                      <td>{v.puesto}</td>
                      <td><strong>S/ {parseFloat(v.total).toFixed(2)}</strong></td>
                      <td><span className={`badge ${v.boleta_impresa ? 'badge-green' : 'badge-gray'}`}>{v.boleta_impresa ? 'Sí' : 'No'}</span></td>
                      <td><button className="btn-sm btn-outline" onClick={() => setSelected(v)}>👁️ Ver</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ventas.length === 0 && <div className="empty-state">No hay ventas para esta fecha</div>}
            </div>
          )}

          {selected && (
            <div className="modal-bg" onClick={() => setSelected(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Detalle Venta #{selected.id}</h3>
                <p><b>Trabajador:</b> {selected.trabajador_nombre} — {selected.puesto}</p>
                <p><b>Fecha:</b> {new Date(selected.fecha_hora).toLocaleString('es-PE')}</p>
                <table className="tabla" style={{marginTop:'12px'}}>
                  <thead><tr><th>Producto</th><th>Cant.</th><th>P.Unit.</th><th>Sub.</th></tr></thead>
                  <tbody>
                    {selected.items?.map((i, idx) => (
                      <tr key={idx}>
                        <td>{i.nombre}</td>
                        <td>{i.cantidad}</td>
                        <td>S/ {parseFloat(i.precio).toFixed(2)}</td>
                        <td>S/ {parseFloat(i.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="carrito-total"><span>TOTAL</span><span>S/ {parseFloat(selected.total).toFixed(2)}</span></div>
                <button className="btn-secondary btn-full" style={{marginTop:'12px'}} onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}