// components/ReturnMenu.jsx
import { createPortal } from "react-dom"

const ReturnMenu = ({ onClose, onApprove, onReject, top, left }) => {
  return createPortal(
    <div className="absolute bg-white border shadow-md rounded z-50 flex flex-col" style={{ top, left }}>
      <button
        onClick={() => {
          onApprove()
          onClose()
        }}
        className="px-4 py-2 text-green-700 hover:bg-green-100 text-left"
      >
        Approve Return
      </button>
      <button
        onClick={() => {
          onReject()
          onClose()
        }}
        className="px-4 py-2 text-red-700 hover:bg-red-100 text-left"
      >
        Reject Return
      </button>
    </div>,
    document.body
  )
}

export default ReturnMenu
