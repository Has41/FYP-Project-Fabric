import React, { useEffect, useState } from "react"

export default function TextTool({
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
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [isFront, setIsFront] = useState(true)

  // Sync form with selected text
  useEffect(() => {
    if (selectedId) {
      const cur = texts.find((t) => t.id === selectedId)
      if (cur) {
        setInputValue(cur.content)
        onTextColorChange(cur.color)
        onFontSizeChange(cur.fontSize)
        setIsFront(cur.isFront)
      }
    } else {
      setInputValue("")
      onTextColorChange("#000000")
      onFontSizeChange(35)
      setIsFront(true)
    }
  }, [selectedId, texts])

  // Handlers
  const handleAdd = () => {
    const newText = {
      id: Date.now().toString(),
      content: inputValue,
      color: textColor,
      fontSize,
      offset: { x: 0, y: 0 },
      isFront
    }
    setTexts((prev) => [...prev, newText])
    setSelectedId(newText.id)
  }

  const handleUpdate = () => {
    if (!selectedId) return
    setTexts((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, content: inputValue, color: textColor, fontSize, isFront } : t))
    )
    setSelectedId(null)
  }

  const handleDelete = () => {
    if (!selectedId) return
    setTexts((prev) => prev.filter((t) => t.id !== selectedId))
    setSelectedId(null)
  }

  const selectText = (id) => setSelectedId((prev) => (prev === id ? null : id))

  const handleOffsetChange = (dx, dy) => {
    if (!selectedId) return
    setTexts((prev) => prev.map((t) => (t.id === selectedId ? { ...t, offset: { x: t.offset.x + dx, y: t.offset.y + dy } } : t)))
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

      <ul className="space-y-1 max-h-32 overflow-auto mb-4">
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

      {selectedId && (
        <div className="flex justify-center items-center mb-4 gap-2">
          <button onClick={() => handleOffsetChange(0, 5)} className="p-1 border rounded">
            ↑
          </button>
          <button onClick={() => handleOffsetChange(-5, 0)} className="p-1 border rounded">
            ←
          </button>
          <button onClick={() => handleOffsetChange(5, 0)} className="p-1 border rounded">
            →
          </button>
          <button onClick={() => handleOffsetChange(0, -5)} className="p-1 border rounded">
            ↓
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium">Text</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border p-1 rounded text-sm"
          placeholder="Type here..."
        />

        <label className="text-sm font-medium">Color</label>
        <input type="color" value={textColor} onChange={(e) => onTextColorChange(e.target.value)} className="h-6 w-full" />

        <label className="text-sm font-medium">Font Size</label>
        <input type="range" min={35} max={50} step={1} value={fontSize} onChange={(e) => onFontSizeChange(+e.target.value)} />

        <div className="flex items-center gap-4 mb-4">
          <label>
            <input type="radio" checked={isFront} onChange={() => setIsFront(true)} /> Front
          </label>
          <label>
            <input type="radio" checked={!isFront} onChange={() => setIsFront(false)} /> Back
          </label>
        </div>

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
