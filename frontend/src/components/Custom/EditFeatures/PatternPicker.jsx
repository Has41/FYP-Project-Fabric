import { useState } from "react"
import { useMutation, useQuery } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import ConvertApi from "convertapi-js"

const PatternPicker = ({ isPatternDragging, closePopup, patternPickerRef, subActiveOption, setSelectedPattern }) => {
  const [customPattern, setCustomPattern] = useState([])
  const [defaultPatterns, setDefaultPatterns] = useState([])
  const [selectedPattern, setSelectedPatternState] = useState(null)

  const { mutate: addCustomPattern, isLoading } = useMutation({
    mutationFn: async (patternData) => {
      const { data } = await axiosInstance.post("/api/v1/patterns/add", patternData)
      return data
    },
    onSuccess: () => {
      refetchCustomPatterns()
      // console.log("Pattern added successfully!")
    }
  })

  const { refetch: refetchDefaultPatterns } = useQuery({
    queryKey: "/api/v1/defaultpatterns",
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/defaultpatterns")
      return data
    },
    onSuccess: (data) => {
      setDefaultPatterns(data?.data)
      // console.log(data?.data)
    },
    onError: (error) => {
      console.error(error)
    }
    // retry: false,
    // refetchOnWindowFocus: false,
    // refetchOnReconnect: false,
    // refetchOnMount: false,
    // staleTime: 24 * 60 * 60 * 1000
  })

  const { refetch: refetchCustomPatterns } = useQuery({
    queryKey: "/api/v1/patterns",
    queryFn: async () => {
      return await axiosInstance.get("/api/v1/patterns")
    },
    onSuccess: (data) => {
      setCustomPattern(data?.data?.data)
      // console.log("Fetched more patterns")
    },
    onError: (error) => {
      console.error(error)
    }
    // retry: false,
    // refetchOnWindowFocus: false,
    // refetchOnReconnect: false,
    // refetchOnMount: false,
    // staleTime: 24 * 60 * 60 * 1000
  })

  const handleFileChange = async (e) => {
    const file = e.target.files[0]

    if (!file) {
      console.error("No file selected.")
      return
    }

    const allowedFileTypes = ["image/jpeg", "image/png"]
    const allowedFileExtensions = [".jpg", ".jpeg", ".png"]

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    if (!allowedFileTypes.includes(file.type) || !allowedFileExtensions.includes(fileExtension)) {
      console.error("Invalid file type. Please upload a JPG, JPEG, or PNG file.")
      return
    }

    const convertApi = ConvertApi.auth(import.meta.env.VITE_API_SVG_API_KEY_SECRET)

    try {
      let params = convertApi.createParams()
      params.add("File", file)
      params.add("ScaleImage", "true")
      params.add("ScaleProportions", "true")
      params.add("ImageHeight", "200")
      params.add("ImageWidth", "200")
      const fileType = file.type === "image/jpeg" || fileExtension === ".jpg" || fileExtension === ".jpeg" ? "jpg" : "png" // Dynamically set source type
      const result = await convertApi.convert(fileType, "svg", params)

      if (result?.files?.length > 0) {
        const svgFileUrl = result.files[0].Url
        const response = await fetch(svgFileUrl)
        const blob = await response.blob()
        const convertedFile = new File([blob], `converted-${Date.now()}.svg`, { type: blob.type })
        const formData = new FormData()
        formData.append("pattern", convertedFile)
        formData.append("name", convertedFile.name)
        addCustomPattern(formData)
        e.target.value = null
      } else {
        console.error("Conversion failed. No output files found.")
      }
    } catch (error) {
      console.error("Error converting image to SVG:", error)
    }
  }

  const handlePatternSelect = (pattern) => {
    setSelectedPatternState(pattern)
    setSelectedPattern(pattern)
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
        {defaultPatterns.map((svg, index) => (
          <div key={index} onClick={() => handlePatternSelect(svg)} className="flex justify-center items-center">
            <div
              className={`m-3 bg-center bg-no-repeat bg-cover size-14 ${
                selectedPattern?.image === svg.image ? "shadow-black" : ""
              } rounded-full shadow-md hover:shadow-2xl transition-shadow duration-500`}
              style={{
                backgroundImage: `url(${svg.image?.url})`
              }}
            />
          </div>
        ))}
      </div>
      <div className="py-6">
        <button
          onClick={() => handlePatternSelect(null)}
          className="bg-black/80 text-white font-poppins hover:bg-white hover:text-black py-2 px-4 rounded transition-colors duration-300"
        >
          Reset Pattern
        </button>
      </div>
      <h2 className="py-4 font-poppins font-bold">Your Custom patterns</h2>

      {customPattern && customPattern.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 my-4 max-w-full">
          {customPattern.map((pattern, index) => (
            <div key={index} onClick={() => handlePatternSelect(pattern)} className="flex justify-center items-center">
              <div
                className={`m-3 bg-center bg-no-repeat ${
                  selectedPattern?.image === pattern.image ? "shadow-black" : ""
                } bg-cover size-14 rounded-full shadow-md hover:shadow-2xl transition-shadow duration-500`}
                style={{
                  backgroundImage: `url(${pattern?.image?.url})`
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <span className="text-slate-500 text-sm font-mont text-center py-4">No custom patterns uploaded</span>
      )}

      <div className="py-4 max-w-[300px]">
        <label
          htmlFor="fileInput"
          className={`px-4 py-2 bg-amber-400 font-poppins text-white rounded-lg cursor-pointer ${
            isLoading ? "bg-dusty-grass cursor-not-allowed" : "bg-dusty-grass hover:bg-amber-500 hover:transition-colors"
          } hover:bg-custom-green transition-colors duration-300`}
        >
          {isLoading ? "Uploading..." : "Upload Pattern"}
        </label>
        <input type="file" disabled={isLoading} id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  )
}

export default PatternPicker
