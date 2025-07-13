import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import { FiTrash2, FiUpload, FiPlus } from "react-icons/fi"

const PatternDetails = () => {
  const queryClient = useQueryClient()
  const [files, setFiles] = useState([])
  const [name, setName] = useState("")

  const {
    data: patterns = [],
    isLoading,
    isError
  } = useQuery(
    ["default-patterns"],
    async () => {
      const res = await axiosInstance.get("/api/v1/defaultpatterns")
      return res.data.data
    },
    {
      onSuccess: (data) => {
        console.log("Fetched patterns:", data)
      },
      onError: (error) => {
        console.error("Error fetching patterns:", error)
      }
    }
  )

  // Add patterns mutation
  const addMutation = useMutation(
    async ({ name, files }) => {
      const formData = new FormData()
      files.forEach((file) => formData.append("pattern", file))
      formData.append("name", name)
      const res = await axiosInstance.post("/api/v1/defaultpatterns/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return res.data.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["default-patterns"])
        setFiles([])
        setName("")
      }
    }
  )

  const deleteMutation = useMutation(
    async (id) => {
      await axiosInstance.delete(`/api/v1/defaultpatterns/${id}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["default-patterns"])
      }
    }
  )

  return (
    <div className="p-6 min-h-screen space-y-8 font-poppins">
      {/* Sleek Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add Patterns</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pattern Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter pattern name"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">SVG Files</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer border border-gray-300 rounded p-2 hover:bg-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiUpload className="text-blue-500" />
                  <span>{files.length > 0 ? `${files.length} files selected` : "Choose files"}</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/svg+xml"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => addMutation.mutate({ name, files })}
                disabled={addMutation.isLoading || files.length === 0 || !name.trim()}
                className="flex items-center gap-2 bg-button-color text-white px-4 py-2 rounded hover:bg-amber-600 transition disabled:opacity-50"
              >
                <FiPlus />
                {addMutation.isLoading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns Display */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Default Patterns</h2>
        {isLoading ? (
          <p className="text-gray-600">Loading patterns...</p>
        ) : isError ? (
          <p className="text-red-500">Error fetching patterns</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {patterns.map((pattern) => (
              <div
                key={pattern._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group"
              >
                <div className="p-4 bg-gray-50 flex justify-center items-center h-48">
                  <img
                    src={pattern?.image?.url}
                    alt={pattern.name || "Pattern"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className=" font-medium text-gray-800 truncate">{pattern.name || "Untitled Pattern"}</h3>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(pattern._id)}
                  disabled={deleteMutation.isLoading}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-70"
                  title="Delete pattern"
                >
                  {deleteMutation.isLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"></svg>
                  ) : (
                    <FiTrash2 size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatternDetails
