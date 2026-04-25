import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function CierreCaja() {
  const [resumen, setResumen] = useState(null)
  const [efectivo, setEfectivo] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/cierre/resumen').then(r => setResumen(r.data)).catch(() => setError('Error cargando resumen')).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const { data } = await api.post('/cierre', { efectivo_real: parseFloat(efectivo) })
      setResultado(data.cierre)
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al cerrar') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="app-layout"><Navbar /><main className="main-content"><div className="loading">Cargando...</div></main></div>

  if (resultado) {
    const dif = parseFloat(resultado.diferencia)
    const iconos = { correcto: '✅', sobrante: '📈', faltante: '⚠️' }
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="cierre-resultado-wrap">
            <div className={`cierre-resultado cierre-${resultado.estado}`}>
              <div className="cr-icon">{iconos[resultado.estado]}</div>
              <h2>Cierre {resultado.estado === 'correcto' ? 'Correcto' : resultado.estado === 'sobrante' ? 'con Sobrante' : 'con Faltante'}</h2>
              <div className="cr-rows">
                <div className="cr-row"><span>Total sistema</span><strong>S/ {parseFloat(resultado.total_sistema).toFixed(2)}</strong></div>
                <div className="cr-row"><span>Efectivo real</span><strong>S/ {parseFloat(resultado.efectivo_real).toFixed(2)}</strong></div>
                <div className={`cr-row cr-dif ${dif > 0 ? 'positiva' : dif < 0 ? 'negativa' : ''}`}>
                  <span>Diferencia</span><strong>S/ {dif.toFixed(2)}</strong>
                </div>
              </div>
              <button className="btn-primary" onClick={() => window.location.href = '/'}>Ir al Inicio</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout"><Navbar />
      <main className="main-content">
        <div className="page-wrap" style={{maxWidth: '600px', margin: '0 auto'}}>
          <h2>💰 Cierre de Caja</h2>
          <p className="subtitle">{new Date().toLocaleDateString('es-PE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>

          {resumen && (
            <div className="resumen-box">
              <h3>Resumen del Día</h3>
              <div className="resumen-stats">
                <div className="rs-item"><span className="rs-val">{resumen.cantidad_ventas}</span><span className="rs-lbl">Ventas</span></div>
                <div className="rs-item highlight"><span className="rs-val">S/ {parseFloat(resumen.total_sistema).toFixed(2)}</span><span className="rs-lbl">Total Sistema</span></div>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <div className="cierre-form-box">
            <h3>Ingresa el efectivo real en caja</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Efectivo Real (S/)</label>
                <input type="number" step="0.01" min="0" value={efectivo} onChange={e => setEfectivo(e.target.value)} placeholder="0.00" className="input-big" required />
              </div>
              <button type="submit" className="btn-primary btn-full" disabled={submitting}>
                {submitting ? '⏳ Procesando...' : '✅ Realizar Cierre'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}