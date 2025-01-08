import { Navigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import LoadingSpinner from "./LoadingSpinner"

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner fill="fill-black" loading={isLoading} />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AuthWrapper
