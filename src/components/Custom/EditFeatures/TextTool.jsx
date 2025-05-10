import { useEffect, useState } from "react"

const TextTool = ({
  textPickerRef,
  texts,
  setTexts,
  subActiveOption,
  closePopup,
  onTextChange,
  textColor,
  onTextColorChange,
  fontSize,
  onFontSizeChange
}) => {
  // Internal state for selected text and front/back
  const [selectedId, setSelectedId] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [isFront, setIsFront] = useState(true)

  // Sync the form when selection changes
  useEffect(() => {
    if (selectedId) {
      const current = texts.find((t) => t.id === selectedId)
      if (current) {
        setInputValue(current.content || "")
        onTextColorChange(current.color || "#000000")
        onFontSizeChange(current.fontSize || 35)
        setIsFront(current.isFront ?? true)
      }
    } else {
      setInputValue("")
      setIsFront(true)
    }
  }, [selectedId, texts, onTextColorChange, onFontSizeChange])

  // Handlers
  const selectText = (id) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const handleOffsetChange = (dx, dy) => {
    if (!selectedId) return
    setTexts((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, offset: { x: (t.offset.x || 0) + dx, y: (t.offset.y || 0) + dy } } : t))
    )
  }

  const handleUpdate = () => {
    if (!selectedId) return
    setTexts((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? {
              ...t,
              content: inputValue,
              color: textColor,
              fontSize,
              isFront
            }
          : t
      )
    )
    onTextChange("")
    setSelectedId(null)
    // closePopup()
  }

  const handleDelete = () => {
    if (!selectedId) return
    setTexts((prev) => prev.filter((t) => t.id !== selectedId))
    setSelectedId(null)
  }

  const handleAdd = () => {
    const newId = Date.now()
    setTexts((prev) => [
      ...prev,
      {
        id: newId,
        content: inputValue,
        color: textColor,
        fontSize,
        offset: { x: 0, y: 0 },
        isFront
      }
    ])
    onTextChange("")
    setSelectedId(newId)
  }

  return (
    <div
      ref={textPickerRef}
      className={`absolute shadow-sm font-poppins ${
        subActiveOption === "Text-Picker" ? "flex" : "hidden"
      } bg-white w-64 flex-col z-[1000] px-4 py-4 rounded border`}
      style={{ transform: "translate(16rem, -8rem)" }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Text Tool</h2>
        <button onClick={closePopup} className="text-gray-800 text-lg">
          ✕
        </button>
      </div>

      {/* Front/Back selector */}
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-1">
          <input type="radio" checked={isFront} onChange={() => setIsFront(true)} />
          Front
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={!isFront} onChange={() => setIsFront(false)} />
          Back
        </label>
      </div>

      {/* List of existing texts */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Texts ({texts.length})</h3>
        <ul className="space-y-1 max-h-32 overflow-auto">
          {texts.map((t) => (
            <li
              key={t.id}
              onClick={() => selectText(t.id)}
              className={`px-2 py-1 rounded cursor-pointer truncate ${
                t.id === selectedId ? "bg-button-color font-medium" : "hover:bg-gray-100"
              }`}
            >
              {t.content} ({t.isFront ? "Front" : "Back"})
            </li>
          ))}
        </ul>
      </div>

      {/* Position controls */}
      {selectedId && (
        <div className="flex justify-center items-center mb-4 gap-2">
          <button onClick={() => handleOffsetChange(0, 5)} className="p-1 border rounded">
            ↑
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleOffsetChange(-5, 0)} className="p-1 border rounded">
              ←
            </button>
            <button onClick={() => handleOffsetChange(5, 0)} className="p-1 border rounded">
              →
            </button>
          </div>
          <button onClick={() => handleOffsetChange(0, -5)} className="p-1 border rounded">
            ↓
          </button>
        </div>
      )}

      {/* Edit/Add form */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium">Text</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            onTextChange(e.target.value)
            setInputValue(e.target.value)
          }}
          className="border p-1 rounded text-sm"
          placeholder="Type here..."
        />

        <label className="text-sm font-medium">Color</label>
        <input type="color" value={textColor} onChange={(e) => onTextColorChange(e.target.value)} className="h-6 w-full" />

        <label className="text-sm font-medium">Font Size</label>
        <input
          type="range"
          min="35"
          max="50"
          step="1"
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
        />
        <span className="text-xs text-gray-500">{fontSize}px</span>

        <div className="flex justify-between mt-3">
          {selectedId ? (
            <>
              <button onClick={handleDelete} className="px-3 py-1 rounded bg-red-500 text-white text-sm">
                Delete
              </button>
              <button onClick={handleUpdate} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
                Update
              </button>
            </>
          ) : (
            <button onClick={handleAdd} className="px-3 py-1 rounded bg-green-600 text-white text-sm">
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TextTool
