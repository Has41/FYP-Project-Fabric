import React from "react"
import { useQuery } from "react-query"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../../utils/axiosInstance"
import { Pie } from "react-chartjs-2"
import "chart.js/auto"
import { FiArrowLeft } from "react-icons/fi"

/**
 * UserOrders component
 *
 * Fetches and displays user dashboard stats and order history.
 * Uses react-query and Chart.js for visualization.
 */
const UserOrders = () => {
  const navigate = useNavigate()

  // Fetch dashboard statistics (separate endpoint)
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = useQuery("dashboardStats", async () => {
    const { data } = await axiosInstance.get("/api/v1/users/dashboard-stats")
    return data.data
  })

  // Ensure default stats shape
  const stats = {
    totalOrders: statsData?.totalOrders ?? 0,
    totalSpent: statsData?.totalSpent ?? 0,
    statusBreakdown: statsData?.statusBreakdown ?? {}
  }

  // Fetch order history
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

  // Prepare chart data for status breakdown
  const breakdown = stats.statusBreakdown || {}
  const statusLabels = Object.keys(breakdown)
  const statusCounts = Object.values(breakdown)

  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        label: "Orders by Status",
        data: statusCounts,
        backgroundColor: statusLabels.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 50%)`)
      }
    ]
  }

  return (
    <div className="p-6 space-y-8 font-poppins max-w-[80%] mx-auto">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-4">
        <FiArrowLeft className="h-4 w-4" />
        Back
      </button>
      <h1 className="text-2xl font-semibold">Dashboard Stats</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-medium">Total Orders</h2>
          <p className="text-3xl">{stats.totalOrders}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-medium">Total Spent</h2>
          <p className="text-3xl">${stats.totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="font-medium mb-4">Order Status Breakdown</h2>
        {statusLabels.length > 0 ? <Pie data={pieData} /> : <p>No status data available</p>}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        {orders.length > 0 ? (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id} className="bg-white shadow rounded p-4 flex flex-col space-y-2">
                <span>
                  <strong>Order ID:</strong> {order._id}
                </span>
                <span>
                  <strong>Status:</strong> {order.orderStatus}
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
    </div>
  )
}

export default UserOrders
