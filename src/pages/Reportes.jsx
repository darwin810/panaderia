import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const getLocalDate = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split('T')[0]
}

export default function Reportes() {
  const [tab, setTab] = useState('dia')
  const [data, setData] = useState([])
  const [totales, setTotales] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({ fecha: getLocalDate() })

  const tabs = [
    { id: 'dia', label: '📅 Por Día' },
    { id: 'puesto', label: '🏪 Por Puesto' },
    { id: 'trabajador', label: '👤 Por Trabajador' },
    { id: 'productos', label: '🥖 Top Productos' },
    { id: 'ingresos', label: '💰 Ingresos Totales' },
  ]

  const cargar = async () => {
    setLoading(true)
    const p = new URLSearchParams()
    const urlMap = {
      dia: () => { p.append('desde', filtros.fecha); p.append('hasta', filtros.fecha); return `/reportes/por-dia?${p}` },
      puesto: () => { p.append('fecha', filtros.fecha); return `/reportes/por-puesto?${p}` },
      trabajador: () => { p.append('fecha', filtros.fecha); return `/reportes/por-trabajador?${p}` },
      productos: () => { p.append('fecha', filtros.fecha); return `/reportes/productos-top?${p}` },
      ingresos: () => { p.append('desde', filtros.fecha); p.append('hasta', filtros.fecha); return `/reportes/ingresos-totales?${p}` },
    }
    try {
      const { data: res } = await api.get(urlMap[tab]())
      if (tab === 'ingresos') { setTotales(res); setData([]) }
      else { setData(Array.isArray(res) ? res : []); setTotales(null) }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [tab, filtros.fecha])

  const renderFiltros = () => {
    return <div className="form-group inline"><label>Fecha:</label><input type="date" value={filtros.fecha} max={getLocalDate()} onChange={e => setFiltros({ fecha: e.target.value })} /></div>
  }

  return (
    <div className="app-layout"><Navbar />
      <main className="main-content">
        <div className="page-wrap">
          <h2>📊 Reportes</h2>
          <div className="tabs-row">{tabs.map(t => <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
          <div className="filtros-row">{renderFiltros()}</div>

          {loading ? <div className="loading">Cargando...</div> : (
            <>
              {tab === 'ingresos' && totales && (
                <div className="ingresos-grid">
                  <div className="ingreso-card"><div className="ic-icon">💰</div><div className="ic-val">$ {parseFloat(totales.total_general).toFixed(2)}</div><div className="ic-lbl">Total Ingresos</div></div>
                  <div className="ingreso-card"><div className="ic-icon">🧾</div><div className="ic-val">{totales.total_ventas}</div><div className="ic-lbl">Ventas Totales</div></div>
                  <div className="ingreso-card"><div className="ic-icon">📈</div><div className="ic-val">$ {parseFloat(totales.promedio_venta).toFixed(2)}</div><div className="ic-lbl">Promedio/Venta</div></div>
                </div>
              )}

              {tab === 'dia' && <ReporteTabla cols={['Fecha', 'Ventas', 'Total']} rows={data.map(r => {
                const parts = r.fecha.split('T')[0].split('-')
                const fechaFormat = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : r.fecha
                return [fechaFormat, r.cantidad_ventas, `$ ${parseFloat(r.total_ingresos).toFixed(2)}`]
              })} />}
              {tab === 'puesto' && <ReporteTabla cols={['Puesto', 'Ventas', 'Total']} rows={data.map(r => [r.puesto, r.cantidad_ventas, `$ ${parseFloat(r.total_ingresos).toFixed(2)}`])} />}
              {tab === 'trabajador' && <ReporteTabla cols={['Trabajador', 'Puesto', 'Ventas', 'Total']} rows={data.map(r => [r.trabajador, r.puesto, r.cantidad_ventas, `$ ${parseFloat(r.total_ingresos).toFixed(2)}`])} />}
              {tab === 'productos' && <ReporteTabla cols={['#', 'Producto', 'Cantidad', 'Total']} rows={data.map((r, i) => [`#${i+1}`, r.nombre_producto, r.total_cantidad, `$ ${parseFloat(r.total_ingresos).toFixed(2)}`])} />}
              {data.length === 0 && !totales && !loading && <div className="empty-state">No hay datos para mostrar</div>}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const ReporteTabla = ({ cols, rows }) => (
  <div className="table-wrap">
    <table className="tabla">
      <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} data-label={cols[j]}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
)