import { Navigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const AdminRoutes = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user && user.role === "admin") return <>{children}</>

  return <Navigate to="/" replace />
}

export default AdminRoutes
