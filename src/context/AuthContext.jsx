import { createContext, useState, useEffect } from "react"
import useFetch from "../hooks/useFetch"

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { data, refetch, isError, error } = useFetch({
    endpoint: "/api/v1/users/get-user",
    method: "GET"
  })

  useEffect(() => {
    if (data && !user) {
      setUser(data?.data)
      setIsAuthenticated(true)
    }
  }, [data, user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setIsAuthenticated, refetch, isError, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
