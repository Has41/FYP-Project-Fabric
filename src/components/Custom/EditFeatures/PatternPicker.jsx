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
      className={`absolute shadow-sm ${
        subActiveOption === "Pattern-Picker" ? "flex" : "hidden"
      } bg-[#FFF] h-80 w-96 flex flex-col items-center z-[1000] px-2 mx-auto ${
        isPatternDragging ? "cursor-grab" : "cursor-pointer"
      }`}
      style={{ transform: "translate(16rem, -8rem)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1>Pattern Library</h1>
          <p>Patterns</p>
        </div>
        <div className="" onClick={closePopup}>
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
      <div className="overflow-y-scroll">
        <div className="grid grid-cols-3 gap-4">
          {patternLibrary.map((svg, index) => (
            <div key={index} onClick={() => setSelectedPattern(svg)} className="flex just3ify-center items-center hide-scrollbar">
              <div
                style={{
                  width: "150px",
                  height: "100px",
                  backgroundImage: `url(${import.meta.env.VITE_API_PUBLIC_URL}${svg})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  margin: "10px",
                  border: "1px solid #ccc"
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatternPicker
