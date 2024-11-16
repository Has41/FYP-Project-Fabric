import React, { useState } from "react"
import { CirclePicker } from "react-color"

const ColorPicker = ({ onColorChange, subActiveOption, closePopup, isColorDragging, colorPickerRef }) => {
  const defaultColor = "#FFF"
  const [color, setColor] = useState(defaultColor)

  const handleChange = (newColor) => {
    setColor(newColor.hex)
    onColorChange(newColor.hex)
  }

  const handleReset = () => {
    setColor(defaultColor)
    onColorChange(defaultColor)
  }

  return (
    <div
      ref={colorPickerRef}
      className={`absolute shadow-sm ${
        subActiveOption === "Color-Picker" ? "flex" : "hidden"
      } bg-[#FFF] h-64 w-72 flex items-center justify-center z-[1000] p-2 mx-auto rounded-md ${
        isColorDragging ? "cursor-grab" : "cursor-pointer"
      }`}
      style={{ transform: "translate(16rem, -8rem)" }}
    >
      <div className="z-10">
        <div className="flex items-center justify-center pb-6 font-poppins">
          <div className="font-semibold tracking-wide text-black/80">Color Picker</div>
          <div className="ml-auto" onClick={closePopup}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 cursor-pointer"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <div>
          <CirclePicker color={color} onChange={handleChange} />
          <button
            onClick={handleReset}
            className="mt-6 font-poppins px-4 py-2 text-sm bg-gray-100 text-gray-800 transition-all duration-300 rounded hover:bg-gray-200"
          >
            Reset Color
          </button>
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
