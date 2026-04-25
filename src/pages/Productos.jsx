import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })

  const cargar = async () => {
    setLoading(true)
    const { data } = await api.get('/productos')
    setProductos(data); setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  const abrirModal = (p = null) => {
    setEditando(p)
    setForm(p ? { nombre: p.nombre, precio: p.precio, categoria: p.categoria } : { nombre: '', precio: '', categoria: '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editando) { await api.put(`/productos/${editando.id}`, { ...form, activo: true }); setMsg({ type: 'success', text: 'Producto actualizado' }) }
      else { await api.post('/productos', form); setMsg({ type: 'success', text: 'Producto creado' }) }
      setShowModal(false); cargar()
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.mensaje || 'Error' }) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await api.delete(`/productos/${id}`)
    setMsg({ type: 'success', text: 'Eliminado' }); cargar()
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
          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {showModal && (
            <div className="modal-bg" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nombre</label>
                    <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Precio (S/)</label>
                    <input type="number" step="0.01" min="0" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} list="cats" required />
                    <datalist id="cats">{categorias.map(c => <option key={c} value={c} />)}</datalist>
                  </div>
                  <div className="modal-btns">
                    <button type="submit" className="btn-primary">{editando ? 'Actualizar' : 'Crear'}</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? <div className="loading">Cargando...</div> : (
            <div className="table-wrap">
              <table className="tabla">
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id}>
                      <td data-label="ID">#{p.id}</td>
                      <td data-label="Nombre">{p.nombre}</td>
                      <td data-label="Precio">S/ {parseFloat(p.precio).toFixed(2)}</td>
                      <td data-label="Categoría"><span className="badge badge-blue">{p.categoria}</span></td>
                      <td data-label="Estado"><span className={`badge ${p.activo ? 'badge-green' : 'badge-red'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td data-label="Acciones">
                        <button className="btn-sm btn-outline" onClick={() => abrirModal(p)}>✏️</button>
                        <button className="btn-sm btn-danger" onClick={() => eliminar(p.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}