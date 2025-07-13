import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import { Bar, Line, Pie } from "react-chartjs-2"
import "chart.js/auto"
import { useNavigate } from "react-router-dom"
import { FiTrash2 } from "react-icons/fi"

const DesignerStats = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [view, setView] = useState("stats") // "stats" or "designs"

  // Common loading and error handling
  const loaders = useQuery("designerDashboard", async () => {
    const { data } = await axiosInstance.get("/api/v1/designers/dashboard")
    return data.data
  })
  const loadersStats = useQuery("designerStats", async () => {
    const { data } = await axiosInstance.get("/api/v1/designers/stats")
    return data.data
  })
  const loadersTop = useQuery("topSellingDesigns", async () => {
    const { data } = await axiosInstance.get("/api/v1/designers/top-selling-designs")
    return data.data
  })
  const loadersMonth = useQuery("monthlyRevenue", async () => {
    const { data } = await axiosInstance.get("/api/v1/designers/monthly-revenue")
    return data.data
  })
  const designsQuery = useQuery("myDesigns", async () => {
    const { data } = await axiosInstance.get("/api/v1/designs/my-designs")
    return data.data
  })

  const toggleMutation = useMutation(
    async ({ id, isPublic }) => {
      const { data } = await axiosInstance.put(`/api/v1/designs/${id}/public`, { isPublic })
      return data.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("myDesigns")
      }
    }
  )

  // Delete design
  const deleteMutation = useMutation(
    async (id) => {
      const { data } = await axiosInstance.delete(`/api/v1/designs/${id}`)
      return data.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("myDesigns")
      }
    }
  )

  const { data: dashData = {}, isLoading: dashLoading, error: dashError } = loaders
  const { data: statsData = {}, isLoading: statsLoading, error: statsError } = loadersStats
  const { data: topDesigns = [], isLoading: topLoading, error: topError } = loadersTop
  const { data: monthly = [], isLoading: monthLoading, error: monthError } = loadersMonth
  const { data: designs = [], isLoading: designsLoading, error: designsError } = designsQuery

  const isLoading = dashLoading || statsLoading || topLoading || monthLoading
  const isError = dashError || statsError || topError || monthError

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading data</div>

  // Chart data
  const topLabels = topDesigns.map((d) => d.designName)
  const topValues = topDesigns.map((d) => d.totalSold)
  const topData = { labels: topLabels, datasets: [{ label: "Units Sold", data: topValues }] }

  const monthLabels = monthly.map((m) => `Month ${m._id}`)
  const monthValues = monthly.map((m) => m.revenue)
  const monthData = { labels: monthLabels, datasets: [{ label: "Revenue", data: monthValues }] }

  return (
    <div className="flex h-full font-poppins">
      {/* Sidebar */}
      <aside className="w-[20%] h-2/4 bg-custom-white rounded-md px-4 py-8 m-4">
        <button
          className={`w-full text-left p-2 mb-3 rounded ${view === "stats" ? "bg-button-color text-white" : "hover:bg-gray-200"}`}
          onClick={() => setView("stats")}
        >
          Design Stats
        </button>
        <button
          className={`w-full text-left p-2 rounded ${view === "designs" ? "bg-button-color text-white" : "hover:bg-gray-200"}`}
          onClick={() => setView("designs")}
        >
          View Designs
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8 max-w-[80%] mx-auto">
        <button onClick={() => navigate("/")} className="mb-4 text-gray-600 hover:text-gray-800 flex items-center">
          ← Back
        </button>

        {view === "stats" ? (
          <>
            <h1 className="text-2xl font-semibold">Your Statistics</h1>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-medium">Total Designs</h2>
                <p className="text-3xl">{dashData.totalDesigns}</p>
              </div>
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-medium">Total Orders</h2>
                <p className="text-3xl">{dashData.totalOrders}</p>
              </div>
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-medium">Total Revenue</h2>
                <p className="text-3xl">${dashData.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-medium">Pending Orders</h2>
                <p className="text-3xl">{dashData.pendingOrders}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-medium mb-4">Designer Profit & Orders</h2>
                <Pie
                  data={{
                    labels: ["Total Orders", "Profit"],
                    datasets: [
                      {
                        data: [statsData.totalOrders, statsData.totalDesignerProfit]
                      }
                    ]
                  }}
                />
              </div>

              <div className="bg-white shadow p-4 rounded">
                <h2 className="font-medium mb-4">Top Selling Designs</h2>
                <Bar data={topData} />
              </div>

              <div className="bg-white shadow p-4 rounded col-span-2">
                <h2 className="font-medium mb-4">Monthly Revenue Trend</h2>
                <Line data={monthData} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <h1 className="text-2xl font-semibold text-black/80 mb-8 text-left">Your Statistics</h1>
            <section>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm lg:text-base bg-white">
                  <thead className="bg-button-color text-white">
                    <tr>
                      <th className="p-3 text-center">#</th>
                      <th className="p-3">Title</th>
                      <th className="p-3 text-center">Public</th>
                      <th className="p-3 text-center">Created At</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designs.map((design, idx) => (
                      <tr key={design._id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3 text-center">{idx + 1}</td>
                        <td className="p-3">{design.title || design.name}</td>
                        <td className="p-3 text-center">
                          <select
                            value={design.isPublic}
                            onChange={(e) =>
                              toggleMutation.mutate({
                                id: design._id,
                                isPublic: e.target.value === "true"
                              })
                            }
                            className="border p-1 rounded"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">{new Date(design.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteMutation.mutate(design._id)}
                            disabled={deleteMutation.isLoading}
                            className="p-2 hover:bg-red-100 rounded"
                            title="Delete Design"
                          >
                            <FiTrash2 size={18} className="text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default DesignerStats
