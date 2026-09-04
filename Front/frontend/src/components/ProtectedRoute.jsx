import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Chargement…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'technician') return <Navigate to="/it/dashboard" replace />
    if (user.role === 'hr') return <Navigate to="/hr/dashboard" replace />
    if (user.role === 'superadmin') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}
