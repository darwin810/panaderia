import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { toast } from 'sonner'
import { imprimirBoleta } from '../utils/imprimirBoleta'

// Helper para optimizar imágenes de Cloudinary en el frontend (w_300,q_auto,f_auto)
const optimizarImagen = (url) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('w_')) {
    return url.replace('/upload/', '/upload/w_300,q_auto,f_auto/');
  }
  return url;
}

export default function NuevaVenta() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [printBoleta, setPrintBoleta] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [loadingProductos, setLoadingProductos] = useState(true)

  useEffect(() => { 
    setLoadingProductos(true)
    api.get('/productos')
      .then(r => setProductos(r.data))
      .finally(() => setLoadingProductos(false))
  }, [])

  const categorias = ['Todas', ...new Set(productos.map(p => p.categoria))]
  const filtrados = productos.filter(p =>
    (categoria === 'Todas' || p.categoria === categoria) &&
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const agregar = (p) => {
    if (p.stock <= 0) {
      toast.error(`El producto ${p.nombre} está agotado (Stock 0)`)
      return;
    }
    setCarrito(prev => {
      const ex = prev.find(i => i.producto_id === p.id)
      if (ex) {
        if (ex.cantidad + 1 > p.stock) {
          toast.error(`Solo quedan ${p.stock} unidades de ${p.nombre}`)
          return prev;
        }
        return prev.map(i => i.producto_id === p.id
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio_unitario }
          : i)
      }
      return [...prev, { producto_id: p.id, nombre_producto: p.nombre, cantidad: 1, precio_unitario: parseFloat(p.precio), subtotal: parseFloat(p.precio) }]
    })
  }

  const cambiarCantidad = (id, qty) => {
    if (qty <= 0) { setCarrito(prev => prev.filter(i => i.producto_id !== id)); return }
    const p = productos.find(x => x.id === id);
    if (p && qty > p.stock) {
      toast.error(`Solo quedan ${p.stock} unidades de ${p.nombre}`)
      return;
    }
    setCarrito(prev => prev.map(i => i.producto_id === id ? { ...i, cantidad: qty, subtotal: qty * i.precio_unitario } : i))
  }

  const total = carrito.reduce((s, i) => s + i.subtotal, 0)

  const registrar = async () => {
    if (!carrito.length) { toast.error('Agrega al menos un producto al carrito'); return }
    setLoading(true);
    try {
      const { data } = await api.post('/ventas', {
        items: carrito,
        metodo_pago: metodoPago,
        boleta_impresa: printBoleta
      })

      const ventaCompleta = {
        ...data.venta,
        items: carrito.map(i => ({
          nombre: i.nombre_producto,
          cantidad: i.cantidad,
          precio: i.precio_unitario,
          subtotal: i.subtotal
        }))
      }

      setSuccess(ventaCompleta)
      setCarrito([])

      // ✅ Imprimir boleta automáticamente si estaba marcado
      if (printBoleta) {
        imprimirBoleta(ventaCompleta)
      }

      // Refrescar productos para obtener el nuevo stock sin cache
      const r = await api.get(`/productos?t=${Date.now()}`)
      setProductos(r.data)
      toast.success('¡Venta registrada con éxito!')
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al registrar la venta') }
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
              <div className="detail-row"><span>Total</span><strong>$ {parseFloat(success.total).toFixed(2)}</strong></div>
              <div className="detail-row"><span>Hora</span><strong>{new Date(success.fecha_hora).toLocaleTimeString('es-CL')}</strong></div>
              <div className="detail-row"><span>Pago</span><strong>{(success.metodo_pago || 'efectivo').toUpperCase()}</strong></div>
            </div>
            <div className="success-btns">
              <button onClick={() => imprimirBoleta(success)} className="btn-print-boleta">
                🖨️ Reimprimir Boleta
              </button>
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
              {loadingProductos ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="prod-card skeleton">
                    <div className="prod-card-img skeleton-img"></div>
                    <span className="prod-nombre skeleton-text"></span>
                    <span className="prod-cat skeleton-text small"></span>
                    <span className="prod-precio skeleton-text"></span>
                  </div>
                ))
              ) : filtrados.length === 0 ? (
                <div className="carrito-empty"><p>No se encontraron productos</p></div>
              ) : (
                filtrados.map(p => (
                  <div key={p.id} className={`prod-card ${p.stock <= 0 ? 'agotado' : ''}`} style={p.stock <= 0 ? { opacity: 0.5 } : {}} onClick={() => agregar(p)}>
                    {p.imagen_url
                      ? <img src={optimizarImagen(p.imagen_url)} alt={p.nombre} className="prod-card-img" onError={e => { e.target.style.display='none' }} loading="lazy" />
                      : <div className="prod-card-emoji">🥖</div>
                    }
                    <span className="prod-nombre">{p.nombre}</span>
                    <span className="prod-cat">{p.categoria}</span>
                    <span className="prod-stock" style={{fontSize:'0.8rem', color: p.stock > 0 ? '#4CAF50' : '#f44336'}}>📦 Stock: {p.stock}</span>
                    <span className="prod-precio">$ {parseFloat(p.precio).toFixed(2)}</span>
                    {p.stock > 0 ? <span className="prod-add">+ Agregar</span> : <span className="prod-add" style={{color: '#f44336'}}>Agotado</span>}
                  </div>
                ))
              )}
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
                          <div className="ci-precio">$ {i.precio_unitario.toFixed(2)} c/u</div>
                        </div>
                        <div className="ci-qty">
                          <button onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}>−</button>
                          <span>{i.cantidad}</span>
                          <button onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}>+</button>
                        </div>
                        <div className="ci-sub">$ {i.subtotal.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="carrito-total">
                    <span>TOTAL</span><span>$ {total.toFixed(2)}</span>
                  </div>

                  {/* Método de pago */}
                  <div className="metodo-pago-group">
                    <label className="metodo-pago-label">💳 Método de pago</label>
                    <div className="metodo-pago-opts">
                      {['efectivo', 'tarjeta', 'transferencia', 'mach'].map(m => (
                        <button
                          key={m}
                          className={`metodo-btn ${metodoPago === m ? 'active' : ''}`}
                          onClick={() => setMetodoPago(m)}
                        >
                          {m === 'efectivo' ? '💵' : m === 'transferencia' ? '🏦' : m === 'mach' ? '🟣' : '💳'} {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkbox imprimir boleta */}
                  <label className={`boleta-check ${printBoleta ? 'boleta-active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={printBoleta}
                      onChange={e => setPrintBoleta(e.target.checked)}
                    />
                    <span>🖨️ Imprimir boleta al registrar</span>
                  </label>

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