import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { toast } from 'sonner'
import api from '../services/api'

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f5f0e8"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="32">🥖</text></svg>'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', stock: '' })
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const cargar = async () => {
    setLoading(true)
    const { data } = await api.get(`/productos?t=${Date.now()}`)
    setProductos(data); setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  const abrirModal = (p = null) => {
    setEditando(p)
    setForm(p ? { nombre: p.nombre, precio: p.precio, categoria: p.categoria, stock: p.stock || 0 } : { nombre: '', precio: '', categoria: '', stock: '' })
    setImagenFile(null)
    setImagenPreview(p?.imagen_url || null)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setImagenFile(null)
    setImagenPreview(null)
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  const quitarImagen = () => {
    setImagenFile(null)
    setImagenPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      // Usar FormData para enviar imagen + campos de texto juntos
      const fd = new FormData()
      fd.append('nombre', form.nombre)
      fd.append('precio', form.precio)
      fd.append('categoria', form.categoria)
      fd.append('stock', form.stock || 0)
      if (imagenFile) fd.append('imagen', imagenFile)

      if (editando) {
        fd.append('activo', 'true')
        await api.put(`/productos/${editando.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Producto actualizado exitosamente')
      } else {
        await api.post('/productos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Producto creado exitosamente')
      }
      cerrarModal(); cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar el producto')
    } finally {
      setUploading(false)
    }
  }

  const eliminarImagen = async (p) => {
    if (!p.imagen_url) return
    if (!confirm('¿Quitar imagen del producto?')) return
    await api.delete(`/productos/${p.id}/imagen`)
    toast.success('Imagen eliminada'); cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await api.delete(`/productos/${id}`)
    toast.success('Producto eliminado'); cargar()
  }

  const categorias = [...new Set(productos.map(p => p.categoria))]

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrap">
          <div className="page-header">
            <h2>📦 Productos</h2>
            <button className="btn-primary" onClick={() => abrirModal()}>+ Nuevo Producto</button>
          </div>

          {/* ── MODAL CREAR / EDITAR ── */}
          {showModal && (
            <div className="modal-bg" onClick={cerrarModal}>
              <div className="modal modal-producto" onClick={e => e.stopPropagation()}>
                <h3>{editando ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
                <form onSubmit={handleSubmit}>

                  {/* Upload de imagen */}
                  <div className="img-upload-area">
                    {imagenPreview
                      ? (
                        <div className="img-preview-wrap">
                          <img src={imagenPreview} alt="preview" className="img-preview" />
                          <button type="button" className="img-remove-btn" onClick={quitarImagen} title="Quitar imagen">✕</button>
                        </div>
                      )
                      : (
                        <label className="img-upload-placeholder" htmlFor="img-input">
                          <span className="img-upload-icon">📷</span>
                          <span>Click para subir imagen</span>
                          <span className="img-upload-hint">JPG, PNG, WEBP · máx 5MB</span>
                        </label>
                      )
                    }
                    <input
                      id="img-input"
                      type="file"
                      accept="image/*"
                      ref={fileRef}
                      onChange={onFileChange}
                      style={{ display: 'none' }}
                    />
                    {imagenPreview && (
                      <label htmlFor="img-input" className="img-change-btn">🔄 Cambiar imagen</label>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Nombre</label>
                    <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej: Pan de molde" />
                  </div>
                  <div className="form-group">
                    <label>Precio ($)</label>
                    <input type="number" step="0.01" min="0" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} list="cats" required placeholder="Ej: Panes, Tortas..." />
                    <datalist id="cats">{categorias.map(c => <option key={c} value={c} />)}</datalist>
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required placeholder="Ej: 10" />
                  </div>

                  <div className="modal-btns">
                    <button type="submit" className="btn-primary" disabled={uploading}>
                      {uploading ? '⏳ Subiendo...' : editando ? '💾 Actualizar' : '✅ Crear'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── GRID DE PRODUCTOS ── */}
          {loading ? <div className="loading">Cargando...</div> : (
            <div className="productos-admin-grid">
              {productos.map(p => (
                <div key={p.id} className={`prod-admin-card ${!p.activo ? 'inactivo' : ''}`}>
                  <div className="prod-admin-img-wrap">
                    <img
                      src={p.imagen_url || PLACEHOLDER}
                      alt={p.nombre}
                      className="prod-admin-img"
                      onError={e => { e.target.src = PLACEHOLDER }}
                    />
                    {p.imagen_url && (
                      <button className="prod-img-del" onClick={() => eliminarImagen(p)} title="Quitar imagen">🗑️</button>
                    )}
                  </div>
                  <div className="prod-admin-info">
                    <div className="prod-admin-nombre">{p.nombre}</div>
                    <div className="prod-admin-cat">
                      <span className="badge badge-blue">{p.categoria}</span>
                      <span className={`badge ${p.activo ? 'badge-green' : 'badge-red'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <div className="prod-admin-precio">$ {parseFloat(p.precio).toFixed(2)}</div>
                    <div className="prod-admin-stock" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                      📦 Stock: <strong>{p.stock}</strong>
                    </div>
                  </div>
                  <div className="prod-admin-actions">
                    <button className="btn-sm btn-outline" onClick={() => abrirModal(p)}>✏️ Editar</button>
                    <button className="btn-sm btn-danger" onClick={() => eliminar(p.id)}>🗑️</button>
                  </div>
                </div>
              ))}

              {productos.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>No hay productos. ¡Crea el primero!</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}