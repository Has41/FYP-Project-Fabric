import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../../../utils/axiosInstance"
import { Bar } from "react-chartjs-2"
import "chart.js/auto"
import { FiArrowLeft, FiEye, FiTrash2 } from "react-icons/fi"

const UserOrders = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("details")

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = useQuery(
    "dashboardStats",
    async () => {
      const { data } = await axiosInstance.get("/api/v1/users/dashboard-stats")
      return data.data
    },
    {
      onSuccess: (data) => {
        console.log("Dashboard Stats:", data)
      }
    }
  )

  const { data: designs } = useQuery("myDesigns", async () => {
    const { data } = await axiosInstance.get("/api/v1/designs/my-designs")
    return data.data
  })

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

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery("orderHistory", async () => {
    const { data } = await axiosInstance.get("/api/v1/users/order-history")
    return data.data
  })

  if (statsLoading || ordersLoading) return <div>Loading...</div>
  if (statsError || ordersError) return <div>Error loading data</div>

  const breakdown = statsData?.statusBreakdown || {}
  const statusLabels = Object.keys(breakdown)
  const statusCounts = Object.values(breakdown)
  const barData = {
    labels: statusLabels,
    datasets: [
      {
        label: "Orders",
        data: statusCounts
      }
    ]
  }
  const barOptions = {
    indexAxis: "y",
    maintainAspectRatio: false,
    aspectRatio: 2,
    scales: {
      x: { beginAtZero: true }
    }
  }

  return (
    <div className="flex font-poppins max-w-full mx-auto h-full">
      {/* Side Panel */}
      <nav className="w-1/4 bg-white shadow h-full p-4 m-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab("details")}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === "details" ? "bg-button-color font-medium" : "hover:bg-gray-100"
              }`}
            >
              Order Details
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("designs")}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === "designs" ? "bg-button-color font-medium" : "hover:bg-gray-100"
              }`}
            >
              Your Designs
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8 overflow-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-4">
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>

        {activeTab === "details" && (
          <>
            <h1 className="text-2xl font-semibold">Order Status Breakdown</h1>
            <div className="bg-white shadow rounded p-4 w-full h-96">
              {statusLabels.length > 0 ? <Bar data={barData} options={barOptions} /> : <p>No status data available</p>}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              {orders.length > 0 ? (
                <ul className="space-y-4">
                  {orders.map((order, index) => (
                    <li key={order._id} className="bg-white shadow rounded p-4 flex flex-col space-y-2">
                      <span>
                        <strong>Order #:</strong> {index + 1}
                      </span>
                      <span>
                        <strong>Status:</strong> {order.deliveryStatus}
                      </span>
                      <span>
                        <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                      </span>
                      <span>
                        <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No orders found.</p>
              )}
            </div>
          </>
        )}

        {activeTab === "designs" && (
          <>
            <h1 className="text-2xl font-semibold">Your Designs</h1>
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
                      <td className="p-3 text-center">{design.title || design.name}</td>
                      <td className="p-3 text-center">
                        {design.isPublic ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}
                      </td>
                      <td className="p-3 text-center">{new Date(design.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <Link
                          to={`/view-design/${design._id}`}
                          className="px-2 py-1 text-blue-800 flex items-center justify-center rounded hover:bg-blue-200"
                        >
                          <FiEye />
                        </Link>
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
          </>
        )}
      </div>
    </div>
  )
}

export default UserOrders
