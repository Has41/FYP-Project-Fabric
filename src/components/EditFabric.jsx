import React, { useState, useRef } from "react"
import useDragger from "../hooks/useDragger"
import { menuOptions, toolOptions, clothOptions } from "../utils/dynamicData"
import ProductCanvas2D from "../utils/ProductCanvas2D"
// import { SketchPicker } from "react-color"

const EditFabric = () => {
  const [activeOption, setActiveOption] = useState("Cloth-Option")
  const [subActiveOption, setSubActiveOption] = useState(null)
  const [selectedColor, setSelectedColor] = useState("lightblue")
  const closePopup = () => setSubActiveOption("")
  const containerRef = useRef(null)

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
            {/* Menu options */}
            <div className="flex items-center justify-evenly bg-[#FFF] shadow-sm py-2 gap-x-6 rounded-md text-lg mt-3">
              {menuOptions?.map((menu, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => setActiveOption(menu.id)}
                    className={`flex items-center justify-center gap-x-2 text-black/80 ${
                      activeOption === menu.id ? "bg-slate-100 rounded-full p-[1px]" : ""
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
                        <path strokeLinecap="round" strokeLinejoin="round" d={menu.path} />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tools */}
            <div className={`flex flex-col gap-y-4 ${activeOption === "Cloth-Option" ? "flex" : "hidden"}`}>
              {toolOptions?.map((tool) => {
                return (
                  <div
                    key={tool.id}
                    onClick={() => setSubActiveOption(tool.id)}
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
                        <path strokeLinecap="round" strokeLinejoin="round" d={tool.path} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm">{tool.title}</h3>
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
                )
              })}
            </div>

            {/* Cloth info */}
            <div className={`flex flex-col gap-y-4 ${activeOption === "Cloth-Info" ? "flex" : "hidden"}`}>
              {clothOptions?.map((cloth, index) => {
                return (
                  <div key={index} className="flex items-center gap-x-3 bg-[#FFF] shadow-sm py-2 px-2 rounded-md cursor-pointer">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 ml-2 text-black/80"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={cloth.path} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm">{cloth.title}</h3>
                    </div>
                    <div className="ml-auto bg-slate-100 py-1 px-2 rounded-md">
                      <p className="text-xs">{cloth.type}</p>
                    </div>
                  </div>
                )
              })}
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
          } bg-[#FFF] h-96 w-64 flex items-center px-2 mx-auto rounded-md ${isColorDragging ? "cursor-grab" : "cursor-pointer"}`}
          style={{ transform: "translate(16rem, -8rem)" }}
        >
          <div>
            <div className="flex justify-center">
              <div>Color Picker</div>
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
            <div>{/* <SketchPicker /> */}</div>
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
        <div className="w-[45%] h-[90%] bg-gray-100 mr-5 rounded-md shadow-sm overflow-hidden">
          <span className="flex items-center justify-center bg-[#FFF] py-1 rounded-t-md shadow-sm">2D</span>
          <div className="flex justify-center items-center h-full ">
            <ProductCanvas2D selectedColor={selectedColor} />
          </div>
        </div>
        <div className="w-[45%] h-[90%] bg-gray-100 mr-5 rounded-md shadow-sm">
          <span className="flex items-center justify-center bg-[#FFF] py-1 rounded-t-md shadow-sm">3D</span>
        </div>
      </section>
    </>
  )
}

export default EditFabric
