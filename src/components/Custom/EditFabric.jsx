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
import { useLocation, useParams } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import PlaceOrderModal from "../Shared/PlaceOrderModal"

const EditFabric = () => {
  const { user } = useAuth()
  const location = useLocation()
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [orderAfterSave, setOrderAfterSave] = useState(false)
  const [selectedDesignId, setSelectedDesignId] = useState(null)
  const captureRef = useRef(null)

  // true if we’re on /view-design/:designerId
  const isViewingDesign = location.pathname.startsWith("/view-design/")
  // true if we’re on /edit-product/:id
  const isEditingProduct = location.pathname.startsWith("/edit-product/")

  const {
    data: designPayload, // this is axiosRes.data.data, or undefined
    isLoading: loadingDesign,
    refetch: refetchDesign,
    isFetching: fetchingDesign,
    isError,
    error
  } = useQuery(
    ["designsById", designerId],
    () => axiosInstance.get(`/api/v1/designs/simple/${designerId}`).then((res) => res.data.data),
    { onSuccess: (data) => console.log(data) },
    { enabled: !!designerId }
  )

  // 2. Sync into local state via useEffect
  useEffect(() => {
    if (designerId && designPayload) {
      console.log("Design payload:", designPayload?.owner?._id !== user?._id)

      setColor(designPayload?.color)
      setTexts(designPayload?.text)
      setGraphics(designPayload?.graphic)
      setSelectedPattern(designPayload?.defaultPattern || designPayload?.pattern)
    }
  }, [designerId, designPayload])

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

  const updateDesign = useMutation((payload) => axiosInstance.put(`/api/v1/designs/${designerId}`, payload), {
    onSuccess: () => {
      queryClient.invalidateQueries("designs")
      queryClient.invalidateQueries(["designsById", designerId])
      setModalOpen(false)
    },
    onError: (err) => {
      console.error("Update failed:", err)
      setModalOpen(false)
    }
  })

  const handleSaveClick = () => setModalOpen(true)
  const handleModalClose = () => setModalOpen(false)
  const handlePlaceOrderClick = () => {
    if (designerId) {
      // An existing design—go straight to ordering
      setIsOrderModalOpen(true)
    } else {
      // New design needs saving first
      setOrderAfterSave(true)
      setModalOpen(true)
    }
  }

  // utility to turn dataURL → Blob
  const dataURLtoBlob = (dataURL) => {
    const [header, base64] = dataURL.split(",")
    const mime = header.match(/:(.*?);/)[1]
    const bin = atob(base64)
    const len = bin.length
    const buf = new Uint8Array(len)
    for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i)
    return new Blob([buf], { type: mime })
  }

  const handleDesignSave = async (isPublic, designName, designerProfit) => {
    try {
      // 1️⃣ Capture screenshot
      const screenshotDataUrl = await captureRef.current?.()
      const screenshotBlob = dataURLtoBlob(screenshotDataUrl)

      // 2️⃣ Prepare FormData - Handle null pattern case
      const form = new FormData()
      if (designName) {
        form.append("name", designName)
      }
      form.append("color", color)
      const profitValue = designerProfit !== undefined ? Number(designerProfit) : 0
      if (profitValue < 0 || profitValue > 5) {
        throw new Error("Designer profit must be between 0 and 5")
      }
      form.append("designerProfit", profitValue)

      // Only append pattern if it exists
      if (selectedPattern?._id) {
        form.append("pattern", selectedPattern._id)
        form.append("defaultPattern", selectedPattern._id)
      }

      form.append("basePrice", 100)
      form.append("isPublic", isPublic)
      form.append("designerProfit", 0)
      form.append("image", screenshotBlob, designerId ? "update.png" : "create.png")

      if (designerId) {
        // 3️⃣ Update existing design
        await updateDesign.mutateAsync(form)
      } else {
        // 4️⃣ Create new design
        form.append("product", id)
        texts.forEach((t) => form.append("text", t._id))
        graphics.forEach((g) => form.append("graphic", g._id))
        const res = await createDesign.mutateAsync(form)
        setSelectedDesignId(res.data.data._id)
      }

      setModalOpen(false)
      if (orderAfterSave) {
        setOrderAfterSave(false)
        setIsOrderModalOpen(true)
      }
    } catch (err) {
      console.error("Save failed:", err)
    }
  }

  // if (designerId && loadingDesign) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <p>Loading design…</p>
  //     </div>
  //   )
  // }

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

            <div className={`flex flex-col gap-y-4 ${activeOption === "Cloth-Option" ? "flex" : "hidden"}`}>
              {toolOptions?.map((tool) => {
                // Only disable if we’re viewing someone else’s design, never disable in edit-product
                const isNotOwner = isViewingDesign && designPayload?.owner?._id !== user?._id

                return (
                  <div
                    key={tool.id}
                    aria-disabled={isNotOwner}
                    onClick={() => !isNotOwner && setSubActiveOption(tool.id)}
                    className={`flex items-center gap-x-3 bg-white
              ${isNotOwner ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
              shadow-sm py-2 px-2 rounded-md`}
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
            <div className={`flex flex-col gap-y-4 ${activeOption === "Cloth-Upload/Save" ? "flex" : "hidden"}`}>
              {saveOptions?.map((save, index) => {
                const isSaveOption = save.type === "Save"
                const displayTitle = designerId && isSaveOption ? "Update Your Design" : save.title
                const displayType = designerId && isSaveOption ? "Update" : save.type
                const isNotOwner = isViewingDesign && designPayload?.owner?._id !== user?._id
                return (
                  <div
                    aria-disabled={isNotOwner}
                    onClick={() => {
                      if (isSaveOption) {
                        if (isNotOwner) return
                        handleSaveClick()
                      } else {
                        handlePlaceOrderClick()
                      }
                    }}
                    key={index}
                    className={` ${
                      isNotOwner && isSaveOption ? "hidden" : "flex"
                    } items-center bg-white shadow-sm py-2 px-2 rounded-lg 
                       cursor-pointer
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`size-5 ml-2 text-black/80`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={save.path} />
                    </svg>

                    <span className={`text-sm ml-2  text-black`}>{displayTitle}</span>
                    <div className={`ml-auto py-1 px-3 rounded-md  bg-slate-100`}>
                      <p className={`text-black text-xs`}>{displayType}</p>
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
          designId={designerId}
          setActiveTextId={setActiveTextId}
          texts={texts}
          refetchDesign={refetchDesign}
          setTexts={setTexts}
          fetchingDesign={fetchingDesign}
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
          fetchingDesign={fetchingDesign}
          refetchDesign={refetchDesign}
          designId={designerId}
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
              onReadyCapture={(captureFn) => {
                captureRef.current = captureFn
              }}
              texts={texts}
              graphics={graphics}
              setTexts={setTexts}
              pattern={selectedPattern}
              color={color}
            />
          </div>
        </div>
        <SaveDesignModel
          savedDesignName={designPayload?.name}
          isOpen={isModalOpen}
          designId={designerId}
          onClose={handleModalClose}
          userRole={user.role}
          onSave={handleDesignSave}
        />
        <PlaceOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          selectedDesignId={selectedDesignId || designerId}
        />
      </section>
    </Fragment>
  )
}

export default EditFabric
