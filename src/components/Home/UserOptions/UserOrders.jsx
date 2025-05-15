import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../../../utils/axiosInstance"
import "chart.js/auto"
import { FiArrowLeft, FiEye, FiRefreshCw, FiTrash2 } from "react-icons/fi"
import EditForm from "../../Shared/EditForm"
import ReturnReasonModal from "../../Shared/ReturnReasonModal"

const UserOrders = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("details")
  const [modalOrderId, setModalOrderId] = useState(null)

  const returnMutation = useMutation(
    async ({ orderId, reason }) => {
      const res = await axiosInstance.post(`/api/v1/orders/${orderId}/return`, { reason })
      return res.data.data
    },
    {
      onSuccess: () => {
        refetchOrders()
        setModalOrderId(null)
      },
      onError: (err) => {
        alert(err.response?.data?.message || "Failed to request return")
      }
    }
  )

  const { data: designs } = useQuery(
    "myDesigns",
    async () => {
      const { data } = await axiosInstance.get("/api/v1/designs/my-designs")
      return data.data
    },
    {
      onSuccess: (data) => {
        console.log("My Designs:", data)
      }
    }
  )

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
  } = useQuery(
    "orderHistory",
    async () => {
      const { data } = await axiosInstance.get("/api/v1/users/order-history")
      return data.data
    },
    {
      onSuccess: (data) => {
        console.log("Order History:", data)
      }
    }
  )

  const handleModalSubmit = (reason) => {
    returnMutation.mutate({ orderId: modalOrderId, reason })
    setModalOrderId(null)
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
          <li>
            <button
              onClick={() => setActiveTab("edit-form")}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === "edit-form" ? "bg-button-color font-medium" : "hover:bg-gray-100"
              }`}
            >
              Edit Profile
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
            <div>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              {orders.length > 0 ? (
                <table className="min-w-full text-sm lg:text-base bg-white shadow rounded overflow-hidden">
                  <thead className="bg-button-color text-white">
                    <tr>
                      <th className="p-3 text-center">#</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Delivery</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3 text-center">{idx + 1}</td>
                        <td className="p-3">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="p-3">${order.totalAmount.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-semibold ${
                              order.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : order.paymentStatus === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.paymentStatus || "Unpaid"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-semibold ${
                              order.deliveryStatus === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.deliveryStatus === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.deliveryStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {order.deliveryStatus === "delivered" && !order.returnRequested ? (
                            <button
                              onClick={() => setModalOrderId(order._id)}
                              disabled={returnMutation.isLoading}
                              className="inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                            >
                              {returnMutation.isLoading && modalOrderId === order._id ? (
                                <span className="loader mr-1" /> /* or a spinner component */
                              ) : (
                                <FiRefreshCw className="mr-1" />
                              )}
                              Return
                            </button>
                          ) : order.returnRequested ? (
                            <span className="text-yellow-600 font-semibold">Return Requested</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-6">No orders found.</p>
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

        {activeTab === "edit-form" && <EditForm />}
      </div>
      <ReturnReasonModal isOpen={!!modalOrderId} onClose={() => setModalOrderId(null)} onSubmit={handleModalSubmit} />
    </div>
  )
}

export default UserOrders
