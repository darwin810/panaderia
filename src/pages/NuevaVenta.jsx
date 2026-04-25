import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function NuevaVenta() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [imprimirBoleta, setImprimirBoleta] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')

  useEffect(() => { api.get('/productos').then(r => setProductos(r.data)) }, [])

  const categorias = ['Todas', ...new Set(productos.map(p => p.categoria))]
  const filtrados = productos.filter(p =>
    (categoria === 'Todas' || p.categoria === categoria) &&
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const agregar = (p) => setCarrito(prev => {
    const ex = prev.find(i => i.producto_id === p.id)
    if (ex) return prev.map(i => i.producto_id === p.id
      ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio_unitario }
      : i)
    return [...prev, { producto_id: p.id, nombre_producto: p.nombre, cantidad: 1, precio_unitario: parseFloat(p.precio), subtotal: parseFloat(p.precio) }]
  })

  const cambiarCantidad = (id, qty) => {
    if (qty <= 0) { setCarrito(prev => prev.filter(i => i.producto_id !== id)); return }
    setCarrito(prev => prev.map(i => i.producto_id === id ? { ...i, cantidad: qty, subtotal: qty * i.precio_unitario } : i))
  }

  const total = carrito.reduce((s, i) => s + i.subtotal, 0)

  const registrar = async () => {
    if (!carrito.length) { setError('Agrega al menos un producto'); return }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/ventas', { items: carrito, metodo_pago: metodoPago, boleta_impresa: imprimirBoleta })
      setSuccess(data.venta); setCarrito([])
    } catch (err) { setError(err.response?.data?.mensaje || 'Error al registrar') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="success-screen">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>¡Venta Registrada!</h2>
            <div className="success-details">
              <div className="detail-row"><span>ID Venta</span><strong>#{success.id}</strong></div>
              <div className="detail-row"><span>Total</span><strong>S/ {parseFloat(success.total).toFixed(2)}</strong></div>
              <div className="detail-row"><span>Hora</span><strong>{new Date(success.fecha_hora).toLocaleTimeString('es-PE')}</strong></div>
            </div>
            <div className="success-btns">
              <button onClick={() => setSuccess(null)} className="btn-primary">🛒 Nueva Venta</button>
              <button onClick={() => window.location.href = '/'} className="btn-secondary">🏠 Inicio</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="venta-layout">
          <div className="productos-panel">
            <h2>🥖 Productos</h2>
            <input className="search-input" placeholder="🔍 Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <div className="cats-tabs">
              {categorias.map(c => (
                <button key={c} className={`cat-tab ${categoria === c ? 'active' : ''}`} onClick={() => setCategoria(c)}>{c}</button>
              ))}
            </div>
            <div className="productos-grid">
              {filtrados.map(p => (
                <div key={p.id} className="prod-card" onClick={() => agregar(p)}>
                  <span className="prod-nombre">{p.nombre}</span>
                  <span className="prod-cat">{p.categoria}</span>
                  <span className="prod-precio">S/ {parseFloat(p.precio).toFixed(2)}</span>
                  <span className="prod-add">+ Agregar</span>
                </div>
              ))}
            </div>
          </div>

          <div className="carrito-panel">
            <h2>🧾 Carrito ({carrito.length})</h2>
            {carrito.length === 0
              ? <div className="carrito-empty"><p>Selecciona productos</p></div>
              : <>
                  <div className="carrito-items">
                    {carrito.map(i => (
                      <div key={i.producto_id} className="carrito-item">
                        <div>
                          <div className="ci-nombre">{i.nombre_producto}</div>
                          <div className="ci-precio">S/ {i.precio_unitario.toFixed(2)} c/u</div>
                        </div>
                        <div className="ci-qty">
                          <button onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}>−</button>
                          <span>{i.cantidad}</span>
                          <button onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}>+</button>
                        </div>
                        <div className="ci-sub">S/ {i.subtotal.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="carrito-total">
                    <span>TOTAL</span><span>S/ {total.toFixed(2)}</span>
                  </div>



                  <label className="boleta-check">
                    <input type="checkbox" checked={imprimirBoleta} onChange={e => setImprimirBoleta(e.target.checked)} />
                    🖨️ Imprimir boleta
                  </label>

                  {error && <div className="alert alert-error">{error}</div>}

                  <button onClick={registrar} className="btn-primary btn-full" disabled={loading}>
                    {loading ? '⏳ Registrando...' : '✅ Registrar Venta'}
                  </button>
                  <button onClick={() => setCarrito([])} className="btn-danger btn-full">🗑️ Limpiar</button>
                </>
            }
          </div>
        </div>
      </main>
    </div>
  )
}