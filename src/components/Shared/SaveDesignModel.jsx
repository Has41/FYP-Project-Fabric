import { useState } from "react"
import { createPortal } from "react-dom"

const SaveDesignModal = ({ isOpen, onClose, userRole, onSave, savedDesignName }) => {
  const [designName, setDesignName] = useState("")
  const [designerProfit, setDesignerProfit] = useState(0)
  if (!isOpen) return null
  console.log("savedDesignName", savedDesignName)

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-poppins">
      <div className="bg-white p-6 rounded-lg w-80">
        {userRole === "designer" ? (
          <>
            <h3 className="text-lg font-semibold mb-2">{savedDesignName ? "Update your design?" : "Make Your Design Public?"}</h3>
            {savedDesignName ? (
              <p className="mb-4">Are you sure you want to update your design?</p>
            ) : (
              <p className="mb-4">Your design will be saved to your account. Do you want to make it public?</p>
            )}
            {!savedDesignName && (
              <>
                <input
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  className="border p-2 mb-4 w-full rounded placeholder:text-sm"
                  placeholder="Enter a name for your design"
                />
                <input
                  type="number"
                  value={designerProfit}
                  min={0}
                  max={5}
                  step={1}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(5, Number(e.target.value)))
                    setDesignerProfit(value)
                  }}
                  onKeyDown={(e) => {
                    if (!/[0-5]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  className="border p-2 mb-4 w-full rounded placeholder:text-sm"
                  placeholder="Enter your profit percentage (0-5)"
                />
              </>
            )}

            <div className="flex flex-col justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2">
                Cancel
              </button>
              <button
                onClick={() => onSave(false, savedDesignName || designName)}
                className="px-4 py-2 bg-button-color cursor-pointer text-white rounded"
              >
                No, Don't Publish
              </button>
              <button
                onClick={() => onSave(true, savedDesignName || designName)}
                className="px-4 py-2 bg-button-color cursor-pointer text-white rounded"
              >
                Yes, Publish
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">{savedDesignName ? "Update your design?" : "Make Your Design Public?"}</h3>
            {savedDesignName ? (
              <p className="mb-4">Are you sure you want to update your design?</p>
            ) : (
              <p className="mb-4">Your design will be saved to your account. Do you want to make it public?</p>
            )}
            {!savedDesignName && (
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="border p-2 mb-4 w-full rounded"
                placeholder="Enter a name for your design"
              />
            )}
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 mr-2">
                Cancel
              </button>
              <button
                onClick={() => onSave(false, designName || savedDesignName)}
                className="px-4 py-2 bg-button-color text-white rounded"
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
