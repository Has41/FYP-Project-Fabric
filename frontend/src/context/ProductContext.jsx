import React, { createContext, useState } from "react"

export const ProductContext = createContext()

export const ProductProvider = ({ children }) => {
  const [productDetails, setProductDetails] = useState(null)

  return <ProductContext.Provider value={{ productDetails, setProductDetails }}>{children}</ProductContext.Provider>
}
