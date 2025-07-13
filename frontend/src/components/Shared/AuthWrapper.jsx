import { Navigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import LoadingSpinner from "./LoadingSpinner"

const AuthWrapper = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner fill="fill-black" loading={isLoading} />
  }

  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AuthWrapper
