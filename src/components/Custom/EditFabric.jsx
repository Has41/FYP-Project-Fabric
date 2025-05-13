import { useState, useRef, useEffect, Fragment } from "react"
import useDragger from "../../hooks/useDragger"
import { menuOptions, toolOptions, clothOptions, saveOptions } from "../../utils/dynamicData"
import Product3DCanvas from "./Product3DCanvas"
import ColorPicker from "./EditFeatures/ColorPicker"
import PatternPicker from "./EditFeatures/PatternPicker"
import TextTool from "./EditFeatures/TextTool"
import GraphicsPicker from "./EditFeatures/GraphicsPicker"
// import TexturePicker from "./EditFeatures/TexturePicker"
import { patternLibrary as patterns } from "../../utils/dynamicData"
import SaveDesignModel from "../Shared/SaveDesignModel"
import useAuth from "../../hooks/useAuth"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useParams } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"

const EditFabric = () => {
  const { user } = useAuth()
  const { id, designerId } = useParams()
  const [activeOption, setActiveOption] = useState("Cloth-Option")
  const [subActiveOption, setSubActiveOption] = useState(null)
  const [color, setColor] = useState("#FFF")
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [textColor, setTextColor] = useState("#000000")
  const [textFontSize, setTextFontSize] = useState(35)
  const [texts, setTexts] = useState([])
  const [graphics, setGraphics] = useState([])
  const [activeTextId, setActiveTextId] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)

  useQuery({
    queryKey: ["designsById", designerId],
    queryFn: () => axiosInstance.get(`/api/v1/designs/simple/${designerId}`).then((res) => res.data.data),
    onSuccess: (data) => {
      console.log(data)
      setColor(data.color)
      setTexts(data.text)
      setGraphics(data.graphic)
    },

    enabled: !!designerId
  })

  const closePopup = () => setSubActiveOption("")
  const containerRef = useRef(null)

  const pickerRefs = {
    colorPickerRef: useRef(null),
    patternPickerRef: useRef(null),
    textPickerRef: useRef(null),
    graphicsPickerRef: useRef(null),
    texturePickerRef: useRef(null)
  }

  const { colorPickerRef, patternPickerRef, textPickerRef, graphicsPickerRef, texturePickerRef } = pickerRefs

  const { isDragging: isColorDragging } = useDragger(colorPickerRef, containerRef)
  const { isDragging: isPatternDragging } = useDragger(patternPickerRef, containerRef)
  const { isDragging: isTextDragging } = useDragger(textPickerRef, containerRef)
  const { isDragging: isGraphicsDragging } = useDragger(graphicsPickerRef, containerRef)
  // const { isDragging: isTextureDragging } = useDragger(texturePickerRef, containerRef)

  const queryClient = useQueryClient()
  const createDesign = useMutation((payload) => axiosInstance.post("/api/v1/designs", payload), {
    onSuccess: () => queryClient.invalidateQueries("designs")
  })

  const handleSaveClick = () => setModalOpen(true)
  const handleModalClose = () => setModalOpen(false)

  const handleDesignSave = (isPublic, designName) => {
    // gather payload
    const payload = {
      name: designName,
      color,
      pattern: selectedPattern?._id || null,
      defaultPattern: selectedPattern?._id || null,
      text: texts.map((t) => t.id),
      graphic: graphics.map((g) => g.id),
      basePrice: 100,
      isPublic,
      designerProfit: 0,
      product: id
    }
    createDesign.mutate(payload)
    setModalOpen(false)
  }

  return (
    <Fragment>
      <section
        ref={containerRef}
        className="bg-slate-50 select-none flex items-center max-w-full w-[97%] h-[95%] rounded-md shadow-md overflow-none"
      >
        <div className="w-[40%] h-full p-8 flex flex-col gap-y-1 font-poppins">
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
                    aria-disabled={!!designerId}
                    key={tool.id}
                    onClick={() => !designerId && setSubActiveOption(tool.id)}
                    className={`flex items-center gap-x-3 bg-[#FFF] ${
                      designerId ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                    } shadow-sm py-2 px-2 rounded-md`}
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
              {saveOptions?.map((save, index) => {
                return (
                  <div
                    onClick={handleSaveClick}
                    key={index}
                    className="flex items-center bg-white shadow-sm py-2 px-2 rounded-lg cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 ml-2 text-black/80"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={save.path} />
                    </svg>

                    <span className="text-sm ml-2">{save.title}</span>
                    <div className="ml-auto bg-slate-100 py-1 px-3 rounded-md">
                      <p className="text-xs">{save.type}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Pop-ups */}
        <ColorPicker
          onColorChange={setColor}
          subActiveOption={subActiveOption}
          closePopup={closePopup}
          isColorDragging={isColorDragging}
          colorPickerRef={colorPickerRef}
        />

        <PatternPicker
          subActiveOption={subActiveOption}
          setSelectedPattern={setSelectedPattern}
          closePopup={closePopup}
          isPatternDragging={isPatternDragging}
          patternPickerRef={patternPickerRef}
          patternLibrary={patterns}
        />

        <TextTool
          subActiveOption={subActiveOption}
          closePopup={closePopup}
          setActiveTextId={setActiveTextId}
          texts={texts}
          setTexts={setTexts}
          isTextDragging={isTextDragging}
          textPickerRef={textPickerRef}
          textColor={textColor}
          onTextColorChange={setTextColor}
          fontSize={textFontSize}
          onFontSizeChange={setTextFontSize}
        />

        <GraphicsPicker
          subActiveOption={subActiveOption}
          closePopup={closePopup}
          graphics={graphics}
          setGraphics={setGraphics}
          isGraphicsDragging={isGraphicsDragging}
          graphicsPickerRef={graphicsPickerRef}
        />

        {/* <TexturePicker
          subActiveOption={subActiveOption}
          closePopup={closePopup}
          isTextureDragging={isTextureDragging}
          texturePickerRef={texturePickerRef}
        /> */}

        <div className="w-[85%] h-[90%] bg-gray-100 mr-5 rounded-md shadow-sm z-0">
          <div className="flex justify-center items-center h-full">
            <Product3DCanvas
              textColor={textColor}
              textFontSize={textFontSize}
              activeTextId={activeTextId}
              setActiveTextId={setActiveTextId}
              texts={texts}
              graphics={graphics}
              setTexts={setTexts}
              pattern={selectedPattern}
              color={color}
            />
          </div>
        </div>
        <SaveDesignModel isOpen={isModalOpen} onClose={handleModalClose} userRole={user.role} onSave={handleDesignSave} />
      </section>
    </Fragment>
  )
}

export default EditFabric
