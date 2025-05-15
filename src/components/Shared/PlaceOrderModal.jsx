import axiosInstance from "../../utils/axiosInstance"
import { useMutation } from "react-query"
import { orderSchema } from "../../utils/zodSchema"
import { createPortal } from "react-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"

const PlaceOrderModal = ({ isOpen, onClose, selectedDesignId, defaultShippingFee = 3 }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      designIds: [selectedDesignId],
      shippingFee: defaultShippingFee,
      paymentMethod: "COD",
      paymentStatus: "pending"
    }
  })

  // Add this inside your component
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form errors:", errors)
    }
  }, [errors])

  useEffect(() => {
    if (isOpen) {
      reset({
        designIds: [selectedDesignId],
        shippingFee: defaultShippingFee,
        paymentMethod: "COD",
        paymentStatus: "pending"
      })
    }
  }, [isOpen, selectedDesignId, defaultShippingFee, reset])

  const placeOrder = useMutation((payload) => axiosInstance.post("/api/v1/orders", payload), {
    onSuccess: ({ data }) => {
      alert(`Order placed! ID: ${data.data._id}`)
      onClose()
    },
    onError: (err) => {
      console.error(err)
      alert(err.response?.data?.message || err.message)
    }
  })

  const onSubmit = async (values) => {
    try {
      console.log("Form values:", values)
      await placeOrder.mutateAsync(values)
    } catch (error) {
      // Error is already handled in useMutation's onError
      console.error("Submission error:", error)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Place Your Order</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Shipping Fee</label>
            <p className="mt-1 text-gray-700">${defaultShippingFee.toFixed(2)}</p>
            <input type="hidden" {...register("shippingFee", { valueAsNumber: true })} value={defaultShippingFee} />
          </div>

          <div>
            <label className="block text-sm font-medium">Payment Method</label>
            <select {...register("paymentMethod")} className="mt-1 block w-full border p-2 rounded">
              <option value="COD">Cash on Delivery</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Hidden designIds array */}
          <input type="hidden" value={selectedDesignId} {...register("designIds.0")} />
          <input type="hidden" {...register("paymentStatus")} />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-button-color text-white rounded ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Processing..." : "Submit Order"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default PlaceOrderModal
