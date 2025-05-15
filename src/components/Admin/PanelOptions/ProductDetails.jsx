import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FiEdit2, FiTrash2, FiSave, FiX, FiPlus, FiCheck } from "react-icons/fi"
import { productSchema } from "../../../utils/zodSchema"
import LoadingSpinner from "../../Shared/LoadingSpinner"

const ProductDetails = () => {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState(null)

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: catLoading } = useQuery(["categories"], async () => {
    const res = await axiosInstance.get("/api/v1/categories")
    return res.data.data
  })

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      discount_price: "",
      quantity: "",
      category: "",
      type: "Shirt"
    }
  })

  // Fetch all products
  const {
    data: products = [],
    isLoading,
    isError
  } = useQuery(
    ["products"],
    async () => {
      const res = await axiosInstance.get("/api/v1/products/all-products")
      return res.data.data
    },
    {
      onSuccess: (data) => {
        console.log(data)
      }
    }
  )

  // Save mutation (add or update)
  const saveMutation = useMutation(
    async (data) => {
      if (data.id) {
        const { id, ...rest } = data
        const res = await axiosInstance.put(`/api/v1/products/update/${id}`, rest)
        return res.data.data
      } else {
        const res = await axiosInstance.post("/api/v1/products/add", data)
        return res.data.data
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["products"])
        reset()
        setEditingId(null)
      }
    }
  )

  // Delete mutation
  const deleteMutation = useMutation(
    async (id) => {
      await axiosInstance.delete(`/api/v1/products/${id}`)
    },
    { onSuccess: () => queryClient.invalidateQueries(["products"]) }
  )

  // Form submit handler
  const onSubmit = (data) => {
    saveMutation.mutate({ ...data, id: editingId, type: "Shirt" })
    reset()
  }

  // Initialize edit state
  const startEdit = (product) => {
    setEditingId(product._id)
    reset({
      title: product.title,
      description: product.description,
      price: String(product.price),
      discount_price: product.discount_price ? String(product.discount_price) : "",
      quantity: String(product.quantity),
      category: product.category?._id || ""
    })
  }

  if (isLoading || catLoading) return <div className="p-6">Loading data...</div>
  if (isError) return <div className="p-6 text-red-500">Error fetching products</div>

  return (
    <div className="p-6 min-h-screen space-y-8 font-poppins">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingId ? "Edit Product" : "Add Product"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(productSchema.shape).map(([key]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace("_", " ")}</label>
              <Controller
                name={key}
                control={control}
                render={({ field }) =>
                  key === "category" ? (
                    <select
                      {...field}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 focus:border-custom-border ${
                        errors[key] ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...field}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-amber-500 focus:border-custom-border ${
                        errors[key] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  )
                }
              />
              {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key].message}</p>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-button-color text-white px-4 py-2 rounded hover:bg-amber-600 transition disabled:opacity-50"
          >
            <FiSave />
            <LoadingSpinner loading={saveMutation.isLoading} loadingText="Adding..." finalText="Add" />
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm lg:text-base">
          <thead className="bg-button-color text-white">
            <tr>
              <th className="p-3 text-center">#</th>
              <th className="p-3">Title</th>
              <th className="p-3">Price</th>
              <th className="p-3">Discounted</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 text-center">{index + 1}</td>

                <td className="p-3">
                  {editingId === product._id ? (
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => <input {...field} className="w-full p-2 border rounded" />}
                    />
                  ) : (
                    product.title
                  )}
                </td>

                <td className="p-3 text-center">
                  {editingId === product._id ? (
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => <input {...field} className="w-full p-2 border rounded" />}
                    />
                  ) : (
                    `$${product.price}`
                  )}
                </td>

                <td className="p-3 text-center">
                  {editingId === product._id ? (
                    <Controller
                      name="discount_price"
                      control={control}
                      render={({ field }) => <input {...field} className="w-full p-2 border rounded" />}
                    />
                  ) : product.discount_price ? (
                    `$${product.discount_price}`
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-3 text-center">
                  {editingId === product._id ? (
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => <input {...field} className="w-full p-2 border rounded" />}
                    />
                  ) : (
                    product.quantity
                  )}
                </td>

                <td className="p-3">
                  {editingId === product._id ? (
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="w-full p-2 border rounded">
                          {categories.map((cat) => (
                            <>
                              <option value="">Select type</option>
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            </>
                          ))}
                        </select>
                      )}
                    />
                  ) : (
                    product.category?.name
                  )}
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">{product.type || "Shirt"}</span>
                </td>

                <td className="p-3 flex justify-center gap-2">
                  {editingId === product._id ? (
                    <>
                      <button
                        onClick={handleSubmit((data) => onSubmit({ ...data, id: product._id }))}
                        disabled={saveMutation.isLoading}
                        className="text-green-600 hover:text-green-800 p-1"
                      >
                        {saveMutation.isLoading ? (
                          <LoadingSpinner loading={true} size="w-5 h-5" color="text-green-600" fill="fill-green-200" />
                        ) : (
                          <FiCheck size={18} />
                        )}
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800 p-1">
                        <FiX size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(product)} className="text-blue-600 hover:text-blue-800 p-1">
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(product._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        disabled={deleteMutation.isLoading}
                      >
                        {deleteMutation.isLoading ? (
                          <LoadingSpinner loading={true} size="w-5 h-5" color="text-red-600" fill="fill-red-200" />
                        ) : (
                          <FiTrash2 size={18} />
                        )}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductDetails
