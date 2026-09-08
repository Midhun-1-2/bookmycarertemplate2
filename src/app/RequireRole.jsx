import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/session'
import { roleAllows } from './roleConfig'

export default function RequireRole({ allow, fallback, children }) {
  const { session } = useSession()
  const location = useLocation()

  if (!session) {
    return <Navigate to={fallback ?? `/login/${allow[0]}`} state={{ from: location }} replace />
  }

  if (!roleAllows(session.role, allow)) {
    return <Navigate to="/" replace />
  }

  return children
}
