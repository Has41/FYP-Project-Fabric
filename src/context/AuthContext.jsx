import { createContext, useState, useEffect } from "react"
import { useQuery } from "react-query"
import axiosInstance from "../utils/axiosInstance"

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const { data, refetch, isLoading } = useQuery({
    queryKey: "/api/v1/users/get-user",
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/users/get-user")
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60 * 1000
  })

  useEffect(() => {
    if (data && !user) {
      setUser(data?.data)
      setIsAuthenticated(true)
      console.log("Authenticating user...")
    }
  }, [data, isAuthenticated])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setIsAuthenticated, refetch, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
