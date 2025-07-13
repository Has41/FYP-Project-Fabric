import { FaCheckCircle } from "react-icons/fa"
import { useMutation } from "react-query"
import { Link, useSearchParams } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { useEffect, useState } from "react"

const OrderSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [statusMessage, setStatusMessage] = useState("Verifying payment...")
  const [isLoading, setIsLoading] = useState(true)

  const verifyPayment = useMutation(
    async (session_id) => {
      const res = await axiosInstance.post("/api/v1/orders/verify-payment", {
        sessionId: session_id
      })
      return res.data
    },
    {
      onSuccess: (data) => {
        setStatusMessage("Payment successful! Your order is confirmed.")
        setIsLoading(false)
        console.log("Order verified:", data)
      },
      onError: (error) => {
        console.error("Verification error:", error)
        setStatusMessage("There was a problem verifying your payment.")
        setIsLoading(false)
      }
    }
  )

  // Trigger the verification as soon as the component mounts
  useEffect(() => {
    if (sessionId) {
      verifyPayment.mutate(sessionId)
    } else {
      setStatusMessage("No session ID found in URL.")
      setIsLoading(false)
    }
  }, [sessionId])

  return (
    <section className="h-screen bg-custom-white flex items-center justify-center">
      <div className="bg-white lg:w-[50%] w-[92%] mx-auto py-14 shadow-lg">
        <div className="text-center">
          <FaCheckCircle className="lg:text-[100px] text-[60px] text-green-600 mx-auto" />
        </div>

        <div className="lg:text-3xl text-lg pt-6 text-center font-bold uppercase">
          {isLoading ? "Processing..." : "Payment Status"}
        </div>

        <div className="text-center py-6">
          <p className="lg:text-xl text-[14px] font-semibold">{statusMessage}</p>
          {isLoading && <p className="text-gray-500 text-sm mt-2">Session ID: {sessionId}</p>}
        </div>

        {!isLoading && (
          <>
            <div className="text-center mt-8">
              <Link to="/user/more">
                <button className="px-5 py-3 border-2 border-black/80 font-bold lg:text-lg text-base rounded-sm hover:bg-black/80 hover:text-white transition-all duration-300 font-poppins">
                  Check Order Details
                </button>
              </Link>
            </div>
            <div className="text-center mt-8">
              <Link to="/">
                <button className="px-5 py-3 border-2 border-black/80 font-bold lg:text-lg text-base rounded-sm hover:bg-black/80 hover:text-white transition-all duration-300 font-poppins">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default OrderSuccess
