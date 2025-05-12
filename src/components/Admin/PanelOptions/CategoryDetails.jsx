import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import { FiEdit2, FiTrash2, FiSave, FiX, FiPlus } from "react-icons/fi"
import LoadingSpinner from "../../Shared/LoadingSpinner"

const CategoryDetails = () => {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState("")

  // Fetch all categories
  const {
    data: categories = [],
    isLoading,
    isError
  } = useQuery(["categories"], async () => {
    const res = await axiosInstance.get("/api/v1/categories")
    return res.data.data
  })

  // Add category mutation
  const addMutation = useMutation(
    async (name) => {
      const res = await axiosInstance.post("/api/v1/categories", { name })
      return res.data.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"])
        setNewName("")
      }
    }
  )

  // Update category mutation
  const updateMutation = useMutation(
    async ({ id, name }) => {
      const res = await axiosInstance.put(`/api/v1/categories/${id}`, { name })
      return res.data.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"])
        setEditingId(null)
        setEditingName("")
      }
    }
  )

  // Delete category mutation
  const deleteMutation = useMutation(
    async (id) => {
      const res = await axiosInstance.delete(`/api/v1/categories/${id}`)
      return res.data.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"])
      }
    }
  )

  if (isLoading) return <div className="p-6">Loading categories...</div>
  if (isError) return <div className="p-6 text-red-500">Error loading data</div>

  return (
    <div className="p-6 h-full overflow-auto space-y-6 font-poppins">
      <h2 className="mb-4 text-xl font-bold text-black/80">Categories</h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add new category"
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => {
            if (e.key === "Enter" && newName.trim()) {
              addMutation.mutate(newName)
            }
          }}
        />
        <button
          onClick={() => addMutation.mutate(newName)}
          disabled={addMutation.isLoading || !newName.trim()}
          className="flex items-center gap-1 px-4 py-2 bg-button-color text-white rounded hover:bg-amber-500 transition disabled:opacity-50"
        >
          <FiPlus size={16} />
          {addMutation.isLoading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Sleek Categories Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm lg:text-base">
          <thead className="bg-button-color text-white">
            <tr>
              <th className="p-3 text-center">#</th>
              <th className="p-3">Category Name</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 text-center">{index + 1}</td>

                <td className="p-3 text-center">
                  {editingId === cat._id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    cat.name
                  )}
                </td>

                <td className="p-3 flex justify-center gap-2">
                  {editingId === cat._id ? (
                    <>
                      <button
                        onClick={() => updateMutation.mutate({ id: cat._id, name: editingName })}
                        disabled={updateMutation.isLoading || !editingName.trim()}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Save"
                      >
                        {updateMutation.isLoading ? (
                          <LoadingSpinner loading={true} size="w-5 h-5" color="text-green-600" fill="fill-green-200" />
                        ) : (
                          <FiSave size={18} />
                        )}
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800 p-1" title="Cancel">
                        <FiX size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(cat._id)
                          setEditingName(cat.name)
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(cat._id)}
                        disabled={deleteMutation.isLoading}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
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

export default CategoryDetails
