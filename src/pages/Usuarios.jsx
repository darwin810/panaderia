import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { toast } from 'sonner'
import api from '../services/api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', usuario: '', password: '', puesto: 'Puesto 1', rol: 'trabajador', activo: true })

  const cargar = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const handleEdit = (u) => {
    setEditing(u.id)
    setForm({ nombre: u.nombre, usuario: u.usuario, password: '', puesto: u.puesto, rol: u.rol, activo: u.activo })
  }

  const handleCancel = () => {
    setEditing(null)
    setForm({ nombre: '', usuario: '', password: '', puesto: 'Puesto 1', rol: 'trabajador', activo: true })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/usuarios/${editing}`, form)
        toast.success('Trabajador actualizado exitosamente')
      } else {
        await api.post('/usuarios', form)
        toast.success('Trabajador creado exitosamente')
      }
      handleCancel()
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar usuario')
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrap">
          <h2>👥 Administrar Trabajadores</h2>
          <p>Solo el Administrador puede asignar el puesto de cada trabajador por seguridad.</p>

          <form onSubmit={handleSave} className="card-panel" style={{ marginBottom: '2rem' }}>
            <h3>{editing ? '✏️ Editar Trabajador' : '➕ Nuevo Trabajador'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Usuario (Login)</label>
                <input required value={form.usuario} onChange={e => setForm({...form, usuario: e.target.value})} disabled={!!editing} />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Contraseña {editing && '(Dejar en blanco para no cambiar)'}</label>
                <input type="password" required={!editing} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Puesto Asignado</label>
                <select value={form.puesto} onChange={e => setForm({...form, puesto: e.target.value})}>
                  <option value="Puesto 1">Puesto 1</option>
                  <option value="Puesto 2">Puesto 2</option>
                  <option value="Puesto 3">Puesto 3</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}>
                  <option value="trabajador">Trabajador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {editing && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                  <input type="checkbox" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} id="activo_chk"/>
                  <label htmlFor="activo_chk" style={{margin: 0}}>Cuenta Activa</label>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="btn-primary">{editing ? '💾 Guardar Cambios' : '➕ Crear Trabajador'}</button>
              {editing && <button type="button" className="btn-secondary" onClick={handleCancel}>❌ Cancelar</button>}
            </div>
          </form>

          {loading ? <div className="loading">Cargando...</div> : (
            <div className="table-wrap">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Puesto</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.5 }}>
                      <td data-label="Nombre">{u.nombre}</td>
                      <td data-label="Usuario">{u.usuario}</td>
                      <td data-label="Puesto"><strong>{u.puesto}</strong></td>
                      <td data-label="Rol">{u.rol === 'admin' ? '👑 Admin' : '👤 Trab.'}</td>
                      <td data-label="Estado">
                        <span className={`badge ${u.activo ? 'badge-green' : 'badge-red'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <button className="btn-sm btn-outline" onClick={() => handleEdit(u)}>✏️ Editar</button>
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
