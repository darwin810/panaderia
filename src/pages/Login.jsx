import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

export default function Login() {
  const [form, setForm] = useState({ usuario: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.usuario, form.password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🥖</div>
          <h1>Sistema de Panadería</h1>
          <p>Ingresa tus credenciales</p>
        </div>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Usuario</label>
            <input type="text" value={form.usuario}
              onChange={e => setForm({...form, usuario: e.target.value})}
              placeholder="Tu usuario" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Tu contraseña" required />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Ingresando...' : '🔐 Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}