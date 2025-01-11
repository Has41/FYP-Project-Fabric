import React, { useState } from "react"
import { useMutation, useQuery } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import ConvertApi from "convertapi-js"

const PatternPicker = ({
  isPatternDragging,
  closePopup,
  patternPickerRef,
  subActiveOption,
  patternLibrary,
  setSelectedPattern
}) => {
  const [customPattern, setCustomPattern] = useState([])

  const { mutate: addCustomPattern, isLoading } = useMutation({
    mutationFn: async (patternData) => {
      const { data } = await axiosInstance.post("/api/v1/pattrens/add", patternData)
      return data
    },
    onSuccess: () => {
      console.log("Pattern added successfully!")
      refetch()
    }
  })

  const { refetch } = useQuery({
    queryKey: "/api/v1/pattrens",
    queryFn: async () => {
      return await axiosInstance.get("/api/v1/pattrens/")
    },
    onSuccess: (data) => {
      setCustomPattern(data?.data?.data)
      console.log("Fetched more patterns")
    },
    onError: (error) => {
      console.error(error)
    }
  })

  const handleFileChange = async (event) => {
    const file = event.target.files[0]

    if (!file) {
      console.error("No file selected.")
      return
    }

    const convertApi = ConvertApi.auth("secret_aouYDaL3mZrr4saN")

    try {
      let params = convertApi.createParams()
      params.add("File", file)
      params.add("ScaleImage", "true")
      params.add("ScaleProportions", "true")
      params.add("ImageHeight", "200")
      params.add("ImageWidth", "200")
      const result = await convertApi.convert("jpg", "svg", params)
      if (result?.files?.length > 0) {
        const svgFileUrl = result.files[0].Url
        const response = await fetch(svgFileUrl)
        const blob = await response.blob()
        const file = new File([blob], `converted-${Date.now()}.svg`, { type: blob.type })
        const formData = new FormData()
        formData.append("pattren", file)
        formData.append("name", file.name)
        addCustomPattern(formData)
        event.target.value = null
      } else {
        console.error("Conversion failed. No output files found.")
      }
    } catch (error) {
      console.error("Error converting JPG to SVG:", error)
    }
  }

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
      <h2 className="py-4 font-poppins">Your Custom patterns</h2>
      <div className="grid grid-cols-3 gap-4">
        {customPattern && customPattern.length > 0 ? (
          customPattern.map((pattern, index) => (
            <div key={index} onClick={() => setSelectedPattern(pattern.image)} className="flex justify-center items-center">
              <div
                className="m-3 bg-center bg-no-repeat bg-cover size-14 rounded-full shadow-md hover:shadow-2xl transition-shadow duration-500"
                style={{
                  backgroundImage: `url(${pattern.image})`
                }}
              />
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-sm pb-4 font-mont">No custom patterns uploaded</p>
        )}
      </div>

      <div className="py-4 max-w-[300px]">
        <label
          htmlFor="fileInput"
          className="px-4 py-2 bg-amber-400 font-poppins text-white rounded-lg cursor-pointer hover:bg-custom-green transition-colors duration-300"
        >
          {isLoading ? "Uploading..." : "Upload Pattern"}
        </label>
        <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  )
}

export default PatternPicker
