import React from "react"

const TexturePicker = ({ texturePickerRef, subActiveOption, isTextureDragging, closePopup }) => {
  return (
    <div
      ref={texturePickerRef}
      className={`absolute shadow-sm ${
        subActiveOption === "Texture-Picker" ? "flex" : "hidden"
      } bg-[#FFF] h-80 w-60 flex items-center z-[1000] px-2 mx-auto ${isTextureDragging ? "cursor-grab" : "cursor-pointer"}`}
      style={{ transform: "translate(16rem, -8rem)" }}
    >
      <div>
        <div>Texture Tool</div>
        <div>Texture Options</div>
      </div>
      <div className="ml-auto" onClick={closePopup}>
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
    </div>
  )
}

export default TexturePicker
