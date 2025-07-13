import { createContext, useState } from "react"
import { useQuery } from "react-query"
import axiosInstance from "../utils/axiosInstance"

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const { refetch, isLoading } = useQuery({
    queryKey: "/api/v1/users/get-user",
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/users/get-user")
      return data
    },
    onSuccess: (data) => {
      console.log(data?.data)
      setUser(data?.data)
    },
    onError: (error) => {
      console.error("Failed to fetch user data:", error)
      setUser(null)
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 24 * 60 * 60 * 1000
  })

  return <AuthContext.Provider value={{ user, setUser, refetch, isLoading }}>{children}</AuthContext.Provider>
}

export default AuthProvider
