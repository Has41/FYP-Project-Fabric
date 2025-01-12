import { useContext } from "react"
import { ProductContext } from "../context/ProductContext"

const useProduct = () => {
  const context = useContext(ProductContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default useProduct
