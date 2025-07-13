import React, { useState } from "react"
import blackImg from "../../assets/test1.png"
import { Link } from "react-router-dom"
import { useQuery } from "react-query"
import axiosInstance from "../../utils/axiosInstance"

const FeaturedProducts = () => {
  const [products, setProducts] = useState([])

  const { refetch } = useQuery({
    queryKey: "/api/v1/products/all-products",
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/products/all-products")
      return data
    },
    onSuccess: (data) => {
      console.log(data?.data)

      setProducts(data?.data)
    },
    onError: (error) => {
      console.error(error)
    }
  })
  return (
    <section className="font-poppins my-4">
      <div className="ml-10 py-10 mb-4">
        <h1 className="text-3xl text-center font-semibold relative after:content-[''] after:w-[200px] after:block after:h-1 after:rounded-2xl after:bg-custom-green after:absolute after:left-1/2 after:transform after:-translate-x-1/2 after:bottom-[-15px]">
          Featured Products
        </h1>
      </div>
      <div className="grid grid-cols-3 gap-y-4 place-items-center">
        {products.map((product, _) => {
          return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="bg-slate-50 w-[330px] h-[420px] py-4 hover:shadow-md hover:border hover:border-slate-100 hover:bg-slate-100 transition-all duration-500 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-y-2">
                <div>
                  <img src={blackImg} width={500} height={500} alt="" />
                </div>
                <div className="flex flex-col items-center justify-center mt-4 gap-y-3">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="text-gray-500 font-mont">{product.category?.name}</p>
                  <p className="text-black/80 font-bold font-mont">${product.price}.00</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default FeaturedProducts
