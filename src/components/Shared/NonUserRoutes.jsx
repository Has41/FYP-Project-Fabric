import useAuth from "../../hooks/useAuth"

const NonUserRoutes = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default NonUserRoutes
