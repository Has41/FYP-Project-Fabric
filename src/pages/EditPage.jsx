import React from "react"
import EditFabric from "../components/Custom/EditFabric"
import axiosInstance from "../utils/axiosInstance"
import { useQuery } from "react-query"
import { useParams } from "react-router-dom"
import useProduct from "../hooks/useProduct"

const EditPage = () => {
  const { id } = useParams()
  const { setProductDetails } = useProduct()
  const { data: product } = useQuery({
    queryKey: ["editProduct", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/v1/products/get/${id}`)
      return data?.data
    },
    onSuccess: () => {
      setProductDetails(product)
    },
    enabled: !!id
  })
  return (
    <main className="bg-black/80 h-screen flex items-center justify-center">
      <EditFabric />
    </main>
  )
}

export default EditPage
