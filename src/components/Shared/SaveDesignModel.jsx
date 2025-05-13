import { useState } from "react"
import { createPortal } from "react-dom"

const SaveDesignModal = ({ isOpen, onClose, userRole, onSave }) => {
  const [designName, setDesignName] = useState("")
  if (!isOpen) return null

  const isDisabled = designName.trim() === ""

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-poppins">
      <div className="bg-white p-6 rounded-lg w-80">
        {userRole === "designer" ? (
          <>
            <h3 className="text-lg font-semibold mb-2">Make Your Design Public?</h3>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="border p-2 mb-4 w-full rounded"
              placeholder="Enter a name for your design"
            />
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2">
                Cancel
              </button>
              <button
                onClick={() => onSave(true, designName)}
                className="px-4 py-2 bg-button-color text-white rounded"
                disabled={isDisabled}
              >
                Yes, Publish
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Design Saved!</h3>
            <p className="mb-4">Your design will be saved to your account. Become a Designer to publish it publicly.</p>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="border p-2 mb-4 w-full rounded"
              placeholder="Enter a name for your design"
            />
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 mr-2">
                Cancel
              </button>
              <button
                onClick={() => onSave(false, designName)}
                className="px-4 py-2 bg-button-color text-white rounded"
                disabled={isDisabled}
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

export default SaveDesignModal
