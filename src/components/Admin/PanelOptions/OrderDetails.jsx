import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import { FiTrash2, FiCheck, FiX, FiEdit2 } from "react-icons/fi"
import LoadingSpinner from "../../Shared/LoadingSpinner"
import { FaInfoCircle } from "react-icons/fa"
import ReturnMenu from "../../Shared/ReturnModal"

const OrderDetails = () => {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ paymentStatus: "", deliveryStatus: "" })
  const [menuPosition, setMenuPosition] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const {
    data: orders = [],
    isLoading,
    isError
  } = useQuery(["orders"], async () => {
    const res = await axiosInstance.get("/api/v1/orders")
    return res.data.data
  })

  const processReturnMutation = useMutation(
    async ({ orderId, action }) => {
      const res = await axiosInstance.put(`/api/v1/orders/${orderId}/process-return`, { action })
      return res.data.data
    },
    {
      onSuccess: () => {
        alert("Return processed")
        queryClient.invalidateQueries(["orders"])
      },
      onError: (err) => {
        alert(err.response?.data?.message || "Failed to process return")
      }
    }
  )

  // Cancel/delete order
  const deleteMutation = useMutation(
    async (id) => {
      await axiosInstance.delete(`/api/v1/orders/${id}`)
    },
    { onSuccess: () => queryClient.invalidateQueries(["orders"]) }
  )

  // Update order status
  const updateMutation = useMutation(
    async ({ id, data }) => {
      if (data.paymentStatus) {
        await axiosInstance.put(`/api/v1/orders/${id}/payment`, { status: data.paymentStatus })
      }
      if (data.deliveryStatus) {
        await axiosInstance.put(`/api/v1/orders/${id}/delivery`, { status: data.deliveryStatus })
      }
    },
    {
      onSuccess: () => queryClient.invalidateQueries(["orders"]),
      onSettled: () => setEditingId(null)
    }
  )

  const startEdit = (order) => {
    setEditingId(order._id)
    setEditData({ paymentStatus: order.paymentStatus, deliveryStatus: order.deliveryStatus })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = (id) => {
    updateMutation.mutate({ id, data: editData })
  }

  const handleStatusChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIconClick = (e, orderId) => {
    const rect = e.currentTarget.getBoundingClientRect()

    if (selectedOrderId === orderId) {
      // Toggle off if same icon is clicked again
      setMenuPosition(null)
      setSelectedOrderId(null)
    } else {
      // Open menu for this order
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      })
      setSelectedOrderId(orderId)
    }
  }

  if (isLoading) return <div className="p-6">Loading orders...</div>
  if (isError) return <div className="p-6 text-red-500">Error loading orders</div>

  return (
    <div className="p-6 min-h-screen space-y-8 font-poppins">
      <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full select-none text-sm lg:text-base">
          <thead className="bg-button-color text-white">
            <tr>
              <th className="p-3 text-center">#</th>
              <th className="p-3">User</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment Status</th>
              <th className="p-3">Delivery Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 text-center">{idx + 1}</td>

                <td className="p-3 text-center">{order?.orderBy?.username}</td>

                <td className="p-3 text-center">${order?.totalAmount}</td>

                <td className="p-3 text-center">
                  {editingId === order._id ? (
                    <select
                      name="paymentStatus"
                      value={editData.paymentStatus}
                      onChange={handleStatusChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select</option>
                      <option value="paid">Paid</option>
                      {/* <option value="pending">Pending</option> */}
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  ) : (
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  )}
                </td>

                <td className="p-3 text-center">
                  {editingId === order._id ? (
                    <select
                      name="deliveryStatus"
                      value={editData.deliveryStatus}
                      onChange={handleStatusChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="returned">Returned</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <div className="flex justify-center">
                      <div
                        className={`px-2 py-1 rounded-full text-sm ${
                          order.deliveryStatus === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.deliveryStatus === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.deliveryStatus}
                      </div>
                      <div>
                        {order.returnRequested && (
                          <FaInfoCircle
                            onClick={(e) => handleIconClick(e, order._id)}
                            className=" text-yellow-500"
                            title="User requested return!"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </td>

                <td className="p-3 flex justify-center gap-2">
                  {editingId === order._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(order._id)}
                        disabled={updateMutation.isLoading}
                        className="text-green-600 hover:text-green-800 p-1"
                      >
                        {updateMutation.isLoading ? (
                          <LoadingSpinner loading={true} size="w-5 h-5" color="text-green-600" fill="fill-green-200" />
                        ) : (
                          <FiCheck size={18} />
                        )}
                      </button>
                      <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-800 p-1">
                        <FiX size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(order)} className="text-blue-600 hover:text-blue-800 p-1">
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(order._id)}
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
        {menuPosition && selectedOrderId && (
          <ReturnMenu
            top={menuPosition.top}
            left={menuPosition.left}
            onClose={() => setMenuPosition(null)}
            onApprove={() => processReturnMutation.mutate({ orderId: selectedOrderId, action: "approve" })}
            onReject={() => processReturnMutation.mutate({ orderId: selectedOrderId, action: "reject" })}
          />
        )}
      </div>
    </div>
  )
}

export default OrderDetails
