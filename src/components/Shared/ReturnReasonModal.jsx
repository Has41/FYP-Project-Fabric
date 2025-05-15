import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const ReturnReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  // Reset state whenever we open/close
  useEffect(() => {
    if (!isOpen) {
      setReason("")
      setError("")
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Request a Return</h3>
        <textarea
          className="w-full border p-2 rounded h-24"
          placeholder="Describe your reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                setError("Please provide a reason")
              } else {
                onSubmit(reason.trim())
              }
            }}
            className="px-4 py-2 bg-button-color text-white rounded hover:bg-opacity-90"
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ReturnReasonModal
