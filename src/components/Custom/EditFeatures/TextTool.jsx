import React from "react"

const TextTool = ({
  textPickerRef,
  isTextDragging,
  subActiveOption,
  closePopup,
  textValue,
  onTextChange,
  textColor,
  onTextColorChange,
  fontSize,
  onFontSizeChange
}) => {
  return (
    <div
      ref={textPickerRef}
      className={`absolute shadow-sm ${
        subActiveOption === "Text-Picker" ? "flex" : "hidden"
      } bg-white h-auto w-60 flex-col items-start z-[1000] px-3 py-4 rounded border ${
        isTextDragging ? "cursor-grab" : "cursor-pointer"
      }`}
      style={{ transform: "translate(16rem, -8rem)" }}
    >
      {/* Close Icon */}
      <div className="ml-auto cursor-pointer" onClick={closePopup}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </div>

      {/* Tool Options */}
      <div className="flex flex-col gap-3 w-full">
        <h2 className="text-lg font-semibold">Text Tool</h2>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Text</label>
          <input
            type="text"
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            className="border p-1 rounded text-sm"
            placeholder="Type here..."
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Color</label>
          <input type="color" value={textColor} onChange={(e) => onTextColorChange(e.target.value)} className="h-6 w-full" />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">Font Size</label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
          />
          <span className="text-xs text-gray-500">{fontSize.toFixed(2)} units</span>
        </div>
      </div>
    </div>
  )
}

export default TextTool
