import React, { useState, useRef } from "react"
import useDragger from "../hooks/useDragger"

const EditFabric = () => {
  const [activeOption, setActiveOption] = useState("Cloth-Option")
  const [subActiveOption, setSubActiveOption] = useState(null)
  const closePopup = () => setSubActiveOption("")
  const containerRef = useRef(null)

  // Create refs for each modal
  const colorPickerRef = useRef(null)
  const patternPickerRef = useRef(null)
  const textPickerRef = useRef(null)
  const graphicsPickerRef = useRef(null)
  const texturePickerRef = useRef(null)

  const { isDragging: isColorDragging } = useDragger(colorPickerRef, containerRef)
  const { isDragging: isPatternDragging } = useDragger(patternPickerRef, containerRef)
  const { isDragging: isTextDragging } = useDragger(textPickerRef, containerRef)
  const { isDragging: isGraphicsDragging } = useDragger(graphicsPickerRef, containerRef)
  const { isDragging: isTextureDragging } = useDragger(texturePickerRef, containerRef)

  return (
    <>
      <section
        ref={containerRef}
        className="bg-slate-50 select-none flex items-center max-w-full w-[97%] h-[95%] rounded-md shadow-md overflow-none"
      >
        <div className="w-[30%] h-full p-8 flex flex-col gap-y-1 font-poppins">
          <div className="flex flex-col gap-y-3 bg-[#FFF] px-4 py-3 rounded-md shadow-sm">
            <div>
              <h2 className="font-semibold text-xl text-black/80">Fabric Design Studio</h2>
            </div>
            <div>
              <p className="text-xs">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio aperiam fugiat, harum omnis fugit recusandae
                mollitia quae distinctio! Dolor
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-evenly bg-[#FFF] shadow-sm py-2 gap-x-6 rounded-md text-lg mt-3">
              <div
                onClick={() => setActiveOption("Cloth-Option")}
                className={`flex items-center justify-center gap-x-2 text-black/80 ${
                  activeOption === "Cloth-Option" ? "bg-slate-100 rounded-full p-[1px]" : ""
                }`}
              >
                <div className="cursor-pointer flex items-center justify-center w-7 h-7">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                    />
                  </svg>
                </div>
              </div>
              <div
                onClick={() => setActiveOption("Cloth-Info")}
                className={`flex items-center justify-center gap-x-2 text-black/80 ${
                  activeOption === "Cloth-Info" ? "bg-slate-100 rounded-full p-[1px]" : ""
                }`}
              >
                <div className="cursor-pointer flex items-center justify-center w-7 h-7">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                  </svg>
                </div>
              </div>
              <div
                onClick={() => setActiveOption("Cloth-Upload/Save")}
                className={`flex items-center justify-center gap-x-2 text-black/80 ${
                  activeOption === "Cloth-Upload/Save" ? "bg-slate-100 rounded-full p-[1px]" : ""
                }`}
              >
                <div className="cursor-pointer flex items-center justify-center w-7 h-7">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className={`flex flex-col gap-y-4 ${activeOption === "Cloth-Option" ? "flex" : "hidden"}`}>
              <div
                onClick={() => setSubActiveOption("Color-Picker")}
                className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer"
              >
                <div className="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Color Picker</h3>
                </div>
                <div className="ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>

              <div
                onClick={() => setSubActiveOption("Pattern-Picker")}
                className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer"
              >
                <div className="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3.75v16.5M2.25 12h19.5M6.375 17.25a4.875 4.875 0 0 0 4.875-4.875V12m6.375 5.25a4.875 4.875 0 0 1-4.875-4.875V12m-9 8.25h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5Zm12.621-9.44c-1.409 1.41-4.242 1.061-4.242 1.061s-.349-2.833 1.06-4.242a2.25 2.25 0 0 1 3.182 3.182ZM10.773 7.63c1.409 1.409 1.06 4.242 1.06 4.242S9 12.22 7.592 10.811a2.25 2.25 0 1 1 3.182-3.182Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Pattern Library</h3>
                </div>
                <div className="ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>

              <div
                onClick={() => setSubActiveOption("Text-Picker")}
                className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer"
              >
                <div className="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Text Tool</h3>
                </div>
                <div className="ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>

              <div
                onClick={() => setSubActiveOption("Graphics-Picker")}
                className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer"
              >
                <div className="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Graphics Tool</h3>
                </div>
                <div className="ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>

              <div
                onClick={() => setSubActiveOption("Texture-Picker")}
                className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer"
              >
                <div className="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12a8.912 8.912 0 0 1-.318-.079c-1.585-.424-2.904-1.247-3.76-2.236-.873-1.009-1.265-2.19-.968-3.301.59-2.2 3.663-3.29 6.863-2.432A8.186 8.186 0 0 1 16.5 5.21M6.42 17.81c.857.99 2.176 1.812 3.761 2.237 3.2.858 6.274-.23 6.863-2.431.233-.868.044-1.779-.465-2.617M3.75 12h16.5"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Texture Options</h3>
                </div>
                <div className="ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cloth info */}
            <div className={`flex flex-col gap-y-4 ${activeOption === "Cloth-Info" ? "flex" : "hidden"}`}>
              <div className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 ml-2 text-black/80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Fabric Type</h3>
                </div>
                <div className="ml-auto bg-slate-100 py-1 px-5 rounded-md">
                  <p className="text-xs">Knit</p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 ml-2 text-black/80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Thickness</h3>
                </div>
                <div className="ml-auto bg-slate-100 py-1 px-3 rounded-md">
                  <p className="text-xs">1.11mm</p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 ml-2 text-black/80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Weight</h3>
                </div>
                <div className="ml-auto bg-slate-100 py-1 px-4 rounded-md">
                  <p className="text-xs">356g</p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 ml-2 text-black/80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm">Pattern Type</h3>
                </div>
                <div className="ml-auto bg-slate-100 py-1 px-3 rounded-md">
                  <p className="text-xs">Geometric</p>
                </div>
              </div>
            </div>

            {/* Save info */}
            <div className={`flex flex-col gap-y-4 ${activeOption === "Cloth-Upload/Save" ? "flex" : "hidden"}`}>
              {/* Save Button */}
              <div className="flex items-center bg-white shadow-sm py-2 px-2 rounded-lg cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 ml-2 text-black/80"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
                  />
                </svg>

                <span className="text-sm ml-2">Save Your Design</span>
                <div className="ml-auto bg-slate-100 py-1 px-3 rounded-md">
                  <p className="text-xs">Save</p>
                </div>
              </div>

              {/* Cart Button */}
              <div className="flex items-center bg-white shadow-sm py-2 px-2 rounded-lg cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 ml-2 text-black/80"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>

                <span className="text-sm ml-2">Add To Cart</span>
                <div className="ml-auto bg-slate-100 py-1 px-3 rounded-md">
                  <p className="text-xs">Cart</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pop-ups */}
        <div
          ref={colorPickerRef}
          className={`absolute shadow-sm ${
            subActiveOption === "Color-Picker" ? "flex" : "hidden"
          } bg-[#FFF] h-80 w-60 flex items-center px-2 mx-auto rounded-md ${isColorDragging ? "cursor-grab" : "cursor-pointer"}`}
          style={{ transform: "translate(16rem, -8rem)" }}
        >
          <div>
            <div>Color Picker</div>
            <div>Colors</div>
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

        <div
          ref={patternPickerRef}
          className={`absolute shadow-sm ${
            subActiveOption === "Pattern-Picker" ? "flex" : "hidden"
          } bg-[#FFF] h-80 w-60 flex items-center px-2 mx-auto ${isPatternDragging ? "cursor-grab" : "cursor-pointer"}`}
          style={{ transform: "translate(16rem, -8rem)" }}
        >
          <div>
            <div>Pattern Library</div>
            <div>Patterns</div>
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

        <div
          ref={textPickerRef}
          className={`absolute shadow-sm ${
            subActiveOption === "Text-Picker" ? "flex" : "hidden"
          } bg-[#FFF] h-80 w-60 flex items-center px-2 mx-auto ${isTextDragging ? "cursor-grab" : "cursor-pointer"}`}
          style={{ transform: "translate(16rem, -8rem)" }}
        >
          <div>
            <div>Text Tool</div>
            <div>Text Options</div>
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

        <div
          ref={graphicsPickerRef}
          className={`absolute shadow-sm ${
            subActiveOption === "Graphics-Picker" ? "flex" : "hidden"
          } bg-[#FFF] h-80 w-60 flex items-center px-2 mx-auto ${isGraphicsDragging ? "cursor-grab" : "cursor-pointer"}`}
          style={{ transform: "translate(16rem, -8rem)" }}
        >
          <div>
            <div>Graphics Tool</div>
            <div>Graphics Options</div>
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

        <div
          ref={texturePickerRef}
          className={`absolute shadow-sm ${
            subActiveOption === "Texture-Picker" ? "flex" : "hidden"
          } bg-[#FFF] h-80 w-60 flex items-center px-2 mx-auto ${isTextureDragging ? "cursor-grab" : "cursor-pointer"}`}
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
        <div className="w-[45%] h-[90%] bg-gray-100 mr-5 rounded-md shadow-sm">
          <span className="flex items-center justify-center bg-[#FFF] py-1 rounded-t-md shadow-sm">2D</span>
        </div>
        <div className="w-[45%] h-[90%] bg-gray-100 mr-5 rounded-md shadow-sm">
          <span className="flex items-center justify-center bg-[#FFF] py-1 rounded-t-md shadow-sm">3D</span>
        </div>
      </section>
    </>
  )
}

export default EditFabric
