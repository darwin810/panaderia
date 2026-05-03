import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { toast } from 'sonner'
import api from '../services/api'

export default function CierreCaja() {
  const [resumen, setResumen] = useState(null)
  const [efectivo, setEfectivo] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/cierre/resumen').then(r => setResumen(r.data)).catch(() => toast.error('Error cargando resumen')).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const { data } = await api.post('/cierre', { efectivo_real: parseFloat(efectivo) })
      toast.success('Cierre de caja guardado exitosamente')
      setResultado(data.cierre)
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al cerrar') }
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
              <div className="cr-icon-wrap">
                <div className="cr-icon">{iconos[resultado.estado]}</div>
              </div>
              <h2>Cierre {resultado.estado === 'correcto' ? 'Correcto' : resultado.estado === 'sobrante' ? 'con Sobrante' : 'con Faltante'}</h2>
              <p className="cr-date">{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <div className="cr-rows">
                <div className="cr-row"><span>Total Sistema</span><strong>$ {parseFloat(resultado.total_sistema).toFixed(2)}</strong></div>
                <div className="cr-row"><span>Efectivo Real</span><strong>$ {parseFloat(resultado.efectivo_real).toFixed(2)}</strong></div>
                <div className="cr-divider"></div>
                <div className={`cr-row cr-dif ${dif > 0 ? 'positiva' : dif < 0 ? 'negativa' : ''}`}>
                  <span>Diferencia</span><strong>{dif > 0 ? '+' : ''}$ {dif.toFixed(2)}</strong>
                </div>
              </div>
              <button className="btn-primary btn-full cr-btn" onClick={() => window.location.href = '/'}>Volver al Inicio</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout"><Navbar />
      <main className="main-content">
        <div className="page-wrap cc-page">
          
          <div className="cc-header">
            <div className="cc-header-text">
              <h2>💰 Cierre de Caja</h2>
              <p className="subtitle">{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="cc-grid">
            {resumen && (
              <div className="resumen-box">
                <div className="rb-header">
                  <h3>Resumen del Día</h3>
                  <p className="resumen-desc">Montos calculados según las ventas en el sistema.</p>
                </div>
                <div className="resumen-stats">
                  <div className="rs-item">
                    <div className="rs-icon-wrap"><span className="rs-icon">🛍️</span></div>
                    <div className="rs-info">
                      <span className="rs-lbl">Total Ventas</span>
                      <span className="rs-val">{resumen.cantidad_ventas}</span>
                    </div>
                  </div>
                  <div className="rs-item highlight">
                    <div className="rs-icon-wrap"><span className="rs-icon">💵</span></div>
                    <div className="rs-info">
                      <span className="rs-lbl">Esperado en Caja</span>
                      <span className="rs-val">$ {parseFloat(resumen.total_sistema).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="cierre-form-box">
              <div className="cf-header">
                <h3>Declaración de Efectivo</h3>
                <p>Ingresa el monto exacto que hay físicamente en la caja ahora mismo.</p>
              </div>
              <form onSubmit={handleSubmit} className="cf-form">
                <div className="form-group">
                  <label>Efectivo Real Contado</label>
                  <div className="input-money-wrap">
                    <span className="money-symbol">$</span>
                    <input type="number" step="0.01" min="0" value={efectivo} onChange={e => setEfectivo(e.target.value)} placeholder="0.00" className="input-big money-input" required autoFocus />
                  </div>
                </div>
                <button type="submit" className="btn-primary btn-full btn-large" disabled={submitting}>
                  {submitting ? '⏳ Verificando cuadre...' : '🔒 Confirmar y Cerrar Caja'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}