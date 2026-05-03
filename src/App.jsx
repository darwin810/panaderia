import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NuevaVenta from './pages/NuevaVenta'
import Productos from './pages/Productos'
import ConsultarVentas from './pages/ConsultarVentas'
import CierreCaja from './pages/CierreCaja'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'

import { Toaster } from 'sonner'

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" expand={true} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/nueva-venta" element={<PrivateRoute><NuevaVenta /></PrivateRoute>} />
          <Route path="/productos" element={<PrivateRoute adminOnly><Productos /></PrivateRoute>} />
          <Route path="/consultar-ventas" element={<PrivateRoute><ConsultarVentas /></PrivateRoute>} />
          <Route path="/cierre-caja" element={<PrivateRoute><CierreCaja /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute adminOnly><Reportes /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute adminOnly><Usuarios /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}