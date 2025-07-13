import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "react-query"
import axiosInstance from "../utils/axiosInstance"
import useAuth from "../hooks/useAuth"
import blackImg from "../assets/test1.png"

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const {
    data: product,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/products/get/${id}`)
      return data?.data
    },
    enabled: !!id
  })

  const handleEditProduct = () => {
    if (user) {
      navigate(`/edit-product/${id}`)
    } else {
      setShowLoginPrompt(true)
    }
  }

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error: {error.message}</p>

  return (
    <>
      <section className="font-poppins my-4">
        <div className="max-w-[90%] mx-auto py-10">
          {/* Product Details Section */}
          <div className="flex gap-12">
            <div className="w-1/2">
              <img
                src={product.image || blackImg}
                alt={product.title}
                className="w-full h-[500px] object-cover rounded-lg shadow"
              />
              <div className="flex gap-4 mt-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <img
                    key={index}
                    src={blackImg}
                    alt="thumbnail"
                    className="size-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-custom-green"
                  />
                ))}
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-6">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-black/80 font-semibold">${product.price}</span>
                {/* <span className="text-gray-400 line-through">${product.originalPrice}</span> */}
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">Sale</span>
              </div>
              <p className="text-gray-600">{product.description}</p>
              <div className="flex items-center gap-4">
                {/* <select
                className="border border-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-custom-green"
                defaultValue="Blue"
              >
                {product.colors?.map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
              </select> */}
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="border border-gray-300 px-4 py-2 w-16 rounded text-center focus:ring-2 focus:ring-custom-green"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleEditProduct}
                  className="bg-black/80 text-white px-6 py-3 rounded-md shadow hover:bg-white hover:text-black/80 transition-colors duration-300"
                >
                  Edit Product
                </button>
              </div>
              <div className="mt-4">
                <p className="text-gray-500">
                  <span className="font-semibold">Category:</span> {product.category?.name}
                </p>
                {/* <p className="text-gray-500">
                <span className="font-semibold">Tags:</span> {product.tags?.join(", ")}
              </p> */}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-12 border-t pt-8">
            <div className="tabs flex gap-8 text-lg font-medium">
              <button className="text-custom-green border-b-2 border-custom-green pb-2">Description</button>
              <button className="text-gray-600 hover:text-custom-green">Additional Information</button>
              <button className="text-gray-600 hover:text-custom-green">Reviews (12)</button>
            </div>
            <div className="mt-6 text-gray-700">{product.description || "No description available."}</div>
          </div>

          {/* Related Products Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="bg-white cursor-pointer rounded-lg p-4 shadow hover:shadow-lg transition">
                  <img src={blackImg} alt="Related Product" className="w-full h-72 object-cover rounded-lg" />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Related Product {index + 1}</h3>
                    <p className="text-green-600 font-bold">$54.00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {showLoginPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4 font-poppins">Login Required</h2>
            <p className="mb-6 text-gray-700 font-mont">You need to log in to edit this product.</p>
            <div className="flex justify-end gap-4 font-poppins">
              <button
                onClick={() => navigate("/auth")}
                className="bg-custom-green text-white px-6 py-3 rounded-md shadow hover:bg-amber-400 transition-colors duration-300"
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="bg-slate-100 text-black/80 px-6 py-3 rounded-md shadow hover:bg-gray-200 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductPage
