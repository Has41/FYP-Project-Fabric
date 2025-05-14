import { useEffect, useState, useRef } from "react"
import { useMutation, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"

export default function GraphicsTool({
  graphicsPickerRef,
  graphics,
  setGraphics,
  designId,
  subActiveOption,
  fetchingDesign,
  closePopup,
  isGraphicsDragging
}) {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [isFront, setIsFront] = useState(true)
  const fileInputRef = useRef()

  // mutation to append a graphic to an existing design
  const pushGraphic = useMutation(
    (graphicId) => axiosInstance.post(`/api/v1/designs/push-graphic/${designId}`, { graphic: graphicId }),
    {
      onSuccess: () => queryClient.invalidateQueries(["designsById", designId]),
      onError: (err) => console.error("Failed to push graphic to design:", err)
    }
  )

  // mutation to add a standalone graphic
  const addGraphic = useMutation((formData) => axiosInstance.post("/api/v1/graphics/add", formData), {
    onSuccess: ({ data }) => {
      const newG = data.data
      // if editing an existing design, push into design
      if (designId) {
        pushGraphic.mutate(newG._id)
      }
      // append to local graphics state
      setGraphics((prev) => [
        ...prev,
        {
          _id: newG._id,
          url: newG.graphic.url,
          width: newG.width,
          height: newG.height,
          offset: newG.offset,
          isFront: newG.isFront
        }
      ])
    }
  })

  // mutation to update an existing graphic
  const updateGraphic = useMutation(
    ({ id, width, height, offset, isFront }) =>
      axiosInstance.put(`/api/v1/graphics/update/${id}`, { width, height, offset, isFront }),
    { onSuccess: () => queryClient.invalidateQueries(["designsById", designId]) }
  )

  // mutation to delete a graphic
  const deleteGraphic = useMutation((id) => axiosInstance.delete(`/api/v1/graphics/delete/${id}`), {
    onSuccess: () => queryClient.invalidateQueries(["designsById", designId])
  })

  useEffect(() => {
    console.log(graphics)
  }, [graphics])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith("image/")) return
    const form = new FormData()
    form.append("images", file)
    form.append("width", 100)
    form.append("height", 100)
    form.append("offset", JSON.stringify({ x: 0, y: 0 }))
    form.append("isFront", isFront)
    addGraphic.mutate(form)
    setSelectedId(null)
    e.target.value = null
  }

  const selectGraphic = (id) => setSelectedId((prev) => (prev === id ? null : id))

  const handleOffset = (dx, dy) => {
    if (!selectedId) return
    setGraphics((prev) =>
      prev.map((g) => (g._id === selectedId ? { ...g, offset: { x: g.offset.x + dx, y: g.offset.y + dy } } : g))
    )
  }

  const handleUpdate = () => {
    if (!selectedId) return
    const g = graphics.find((g) => g._id === selectedId)
    if (designId) {
      // update via API
      updateGraphic.mutate({ id: selectedId, width: g.width, height: g.height, offset: g.offset, isFront })
    } else {
      console.log("Updating graphic locally")

      // update local state
      setGraphics((prev) =>
        prev.map((item) =>
          item._id === selectedId ? { ...item, width: g.width, height: g.height, offset: g.offset, isFront } : item
        )
      )
    }
    setSelectedId(null)
  }

  const handleDelete = () => {
    if (selectedId) {
      if (designId) {
        // delete on backend for existing design
        deleteGraphic.mutate(selectedId)
      } else {
        // remove from local state
        setGraphics((prev) => prev.filter((g) => g._id !== selectedId))
      }
    }
    setSelectedId(null)
  }

  const handleSizeChange = (field, value) => {
    if (!selectedId) return
    setGraphics((prev) => prev.map((g) => (g._id === selectedId ? { ...g, [field]: parseInt(value, 10) } : g)))
  }

  return (
    <div
      ref={graphicsPickerRef}
      className={`absolute shadow-sm font-poppins ${
        subActiveOption === "Graphics-Picker" ? "flex" : "hidden"
      } bg-white w-64 flex-col z-[1000] px-4 py-4 rounded border ${isGraphicsDragging ? "cursor-grab" : "cursor-pointer"}`}
      style={{ transform: "translate(16rem, -8rem)" }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Graphics Tool</h2>
        <button onClick={closePopup} className="text-gray-800 text-lg">
          ✕
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload Image</label>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-1">
          <input type="radio" checked={isFront} onChange={() => setIsFront(true)} /> Front
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={!isFront} onChange={() => setIsFront(false)} /> Back
        </label>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Images ({graphics.length})</h3>
        <ul className="space-y-1 max-h-32 overflow-auto">
          {graphics.map((g) => (
            <li
              key={g._id}
              onClick={() => selectGraphic(g._id)}
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer truncate ${
                g._id === selectedId ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <img
                src={
                  // support standalone or nested graphic URLs
                  g?.url || g.graphic?.url || ""
                }
                alt="thumb"
                className="h-6 w-6 object-cover rounded"
              />
              <span className="text-xs truncate">{g._id}</span>
              <span className="text-xs italic">({g.isFront ? "Front" : "Back"})</span>
            </li>
          ))}
        </ul>
      </div>

      {selectedId && (
        <div className="flex justify-center items-center mb-4 gap-2">
          <button onClick={() => handleOffset(0, 5)} className="p-1 border rounded">
            ↑
          </button>
          <button onClick={() => handleOffset(-5, 0)} className="p-1 border rounded">
            ←
          </button>
          <button onClick={() => handleOffset(5, 0)} className="p-1 border rounded">
            →
          </button>
          <button onClick={() => handleOffset(0, -5)} className="p-1 border rounded">
            ↓
          </button>
        </div>
      )}

      {selectedId && (
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium">Width</label>
          <input
            type="range"
            min={20}
            max={500}
            step={1}
            value={graphics.find((g) => g._id === selectedId)?.width || 100}
            onChange={(e) => handleSizeChange("width", e.target.value)}
          />
          <label className="text-sm font-medium">Height</label>
          <input
            type="range"
            min={20}
            max={500}
            step={1}
            value={graphics.find((g) => g._id === selectedId)?.height || 100}
            onChange={(e) => handleSizeChange("height", e.target.value)}
          />
        </div>
      )}

      {selectedId && (
        <div className="flex flex-col gap-y-4 justify-between mt-2">
          <button onClick={handleDelete} className="px-3 py-1 rounded bg-red-500 text-white text-sm">
            Delete Image
          </button>
          <button onClick={handleUpdate} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
            Update Image
          </button>
        </div>
      )}
    </div>
  )
}
