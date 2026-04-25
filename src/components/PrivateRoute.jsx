import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner"/></div>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.rol !== 'admin') return <Navigate to="/" />
  return children
}

export default PrivateRoute