import axiosInstance from "../../utils/axiosInstance"
import { useMutation } from "react-query"
import { orderSchema } from "../../utils/zodSchema"
import { createPortal } from "react-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import useAuth from "../../hooks/useAuth"

// Load Stripe using Vite environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PlaceOrderModal = ({ isOpen, onClose, selectedDesignId, defaultShippingFee = 3 }) => {
  const { user } = useAuth()
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
      paymentStatus: "pending",
      shippingAddress: user?.address || ""
    }
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        designIds: [selectedDesignId],
        shippingFee: defaultShippingFee,
        paymentMethod: "COD",
        paymentStatus: "pending",
        shippingAddress: user?.address || ""
      })
    }
  }, [isOpen, selectedDesignId, defaultShippingFee, reset, user?.address])

  const placeOrder = useMutation((payload) => axiosInstance.post("/api/v1/orders/create", payload), {
    onError: (err) => {
      console.error(err)
      alert(err.response?.data?.message || err.message)
    }
  })

  const onSubmit = async (values) => {
    try {
      console.log("Form values:", values)
      const response = await placeOrder.mutateAsync(values)
      const { order, stripeSessionUrl } = response.data.data

      if (values.paymentMethod === "online") {
        // Redirect to Stripe Checkout URL
        window.location.href = stripeSessionUrl
      } else {
        // Cash on Delivery flow
        alert(`Order placed! ID: ${order._id}`)
        onClose()
      }
    } catch (error) {
      console.error("Submission error:", error)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-full overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Place Your Order</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium">Shipping Address</label>
            <textarea {...register("shippingAddress")} className="mt-1 block w-full border p-2 rounded" rows={3} />
            {errors.shippingAddress && <p className="text-sm text-red-500">{errors.shippingAddress.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Shipping Fee</label>
            <p className="mt-1 text-gray-700">${defaultShippingFee.toFixed(2)}</p>
            <input type="hidden" {...register("shippingFee", { valueAsNumber: true })} />
          </div>

          <div>
            <label className="block text-sm font-medium">Payment Method</label>
            <select {...register("paymentMethod")} className="mt-1 block w-full border p-2 rounded">
              <option value="COD">Cash on Delivery</option>
              <option value="online">Card (Online)</option>
            </select>
          </div>

          {/* Hidden fields */}
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
