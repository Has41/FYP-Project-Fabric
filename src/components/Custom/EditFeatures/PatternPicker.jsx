import React from "react"

const PatternPicker = ({
  isPatternDragging,
  closePopup,
  patternPickerRef,
  subActiveOption,
  patternLibrary,
  setSelectedPattern
}) => {
  return (
    <div
      ref={patternPickerRef}
      className={`absolute shadow-sm overflow-y-auto rounded-md ${
        subActiveOption === "Pattern-Picker" ? "flex" : "hidden"
      } bg-[#FFF] size-80 flex flex-col items-center z-[1000] px-2 mx-auto ${
        isPatternDragging ? "cursor-grab" : "cursor-pointer"
      }`}
      style={{ transform: "translate(16rem, -8rem)" }}
    >
      <div className="flex items-center justify-between w-full px-4 py-5 mb-2 font-poppins">
        <div className="font-semibold tracking-wide text-black/80">Pattern Library</div>
        <div onClick={closePopup} className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {patternLibrary.map((svg, index) => (
          <div key={index} onClick={() => setSelectedPattern(svg)} className="flex justify-center items-center">
            <div
              className="m-3 bg-center bg-no-repeat bg-cover size-14 rounded-full shadow-md hover:shadow-2xl transition-shadow duration-500"
              style={{
                backgroundImage: `url(${import.meta.env.VITE_API_PUBLIC_URL}${svg})`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PatternPicker
