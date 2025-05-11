import React, { useEffect, useState, useRef } from "react"

export default function GraphicsTool({
  graphicsPickerRef,
  graphics,
  setGraphics,
  subActiveOption,
  closePopup,
  isGraphicsDragging
}) {
  // internal selection state
  const [selectedId, setSelectedId] = useState(null)
  const [isFront, setIsFront] = useState(true)
  const fileInputRef = useRef()

  // Sync isFront when selecting existing graphic
  useEffect(() => {
    if (selectedId) {
      const current = graphics.find((g) => g.id === selectedId)
      if (current) {
        setIsFront(current.isFront ?? true)
      }
    } else {
      setIsFront(true)
    }
  }, [selectedId, graphics])

  // handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    const id = Date.now()
    setGraphics((prev) => [...prev, { id, url, offset: { x: 0, y: 0 }, width: 100, height: 100, isFront }])
    setSelectedId(id)
    e.target.value = null
  }

  const selectGraphic = (id) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const handleOffset = (dx, dy) => {
    if (!selectedId) return
    setGraphics((prev) =>
      prev.map((g) => (g.id === selectedId ? { ...g, offset: { x: g.offset.x + dx, y: g.offset.y + dy } } : g))
    )
  }

  const handleDelete = () => {
    if (!selectedId) return
    setGraphics((prev) => prev.filter((g) => g.id !== selectedId))
    setSelectedId(null)
  }

  const handleSizeChange = (field, value) => {
    if (!selectedId) return
    setGraphics((prev) => prev.map((g) => (g.id === selectedId ? { ...g, [field]: parseInt(value, 10) } : g)))
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

      {/* Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload Image</label>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm" />
      </div>

      {/* Front/Back selector */}
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-1">
          <input type="radio" checked={isFront} onChange={() => setIsFront(true)} /> Front
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={!isFront} onChange={() => setIsFront(false)} /> Back
        </label>
      </div>

      {/* List of images */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Images ({graphics.length})</h3>
        <ul className="space-y-1 max-h-32 overflow-auto">
          {graphics.map((g) => (
            <li
              key={g.id}
              onClick={() => selectGraphic(g.id)}
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer truncate ${
                g.id === selectedId ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <img src={g.url} alt="thumb" className="h-6 w-6 object-cover rounded" />
              <span className="text-xs truncate">{g.id}</span>
              <span className="text-xs italic">({g.isFront ? "Front" : "Back"})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Position controls */}
      {selectedId && (
        <div className="flex justify-center items-center mb-4 gap-2">
          <button onClick={() => handleOffset(0, 5)} className="p-1 border rounded">
            ↑
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleOffset(-5, 0)} className="p-1 border rounded">
              ←
            </button>
            <button onClick={() => handleOffset(5, 0)} className="p-1 border rounded">
              →
            </button>
          </div>
          <button onClick={() => handleOffset(0, -5)} className="p-1 border rounded">
            ↓
          </button>
        </div>
      )}

      {/* Resize controls */}
      {selectedId && (
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium">Width</label>
          <input
            type="range"
            min="20"
            max="size * 0.9"
            step="1"
            value={graphics.find((g) => g.id === selectedId)?.width || 100}
            onChange={(e) => handleSizeChange("width", e.target.value)}
          />
          <label className="text-sm font-medium">Height</label>
          <input
            type="range"
            min="20"
            max="size * 0.9"
            step="1"
            value={graphics.find((g) => g.id === selectedId)?.height || 100}
            onChange={(e) => handleSizeChange("height", e.target.value)}
          />
        </div>
      )}

      {/* Delete */}
      {selectedId && (
        <button onClick={handleDelete} className="px-3 py-1 rounded bg-red-500 text-white text-sm">
          Delete Image
        </button>
      )}
    </div>
  )
}
