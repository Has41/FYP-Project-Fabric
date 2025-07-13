import { useEffect, useState } from "react"
import { useMutation } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"

export default function TextTool({
  textPickerRef,
  texts,
  refetchDesign,
  setTexts,
  designId,
  subActiveOption,
  fetchingDesign,
  closePopup,
  textColor,
  onTextColorChange,
  fontSize,
  onFontSizeChange
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [isFront, setIsFront] = useState(true)

  // mutation to append a text ID to an existing design
  const pushText = useMutation((textId) => axiosInstance.post(`/api/v1/designs/push-text/${designId}`, { text: textId }), {
    onSuccess: () => refetchDesign(),
    onError: (err) => console.error("Failed to push text to design:", err)
  })

  // mutation to create a new text object
  const addText = useMutation((payload) => axiosInstance.post("/api/v1/texts/add", payload), {
    onSuccess: ({ data }) => {
      const newTextObj = data.data
      if (designId) {
        // if editing existing design, also push ID into design
        pushText.mutate(newTextObj._id)
      }
      // append newly created text object locally
      setTexts((prev) => [
        ...prev,
        {
          _id: newTextObj._id,
          text: newTextObj.text,
          color: newTextObj.color,
          fontSize: newTextObj.fontSize,
          offset: newTextObj.offset,
          isFront: newTextObj.isFront
        }
      ])
      setInputValue("")
      setSelectedId(null)
    },
    onError: (error) => console.error("Error adding text:", error)
  })

  // mutation to update an existing text object
  const updateText = useMutation(({ id, ...body }) => axiosInstance.put(`/api/v1/texts/update/${id}`, body), {
    onSuccess: () => refetchDesign()
  })

  // mutation to delete a text object (and remove from design)
  const deleteText = useMutation((id) => axiosInstance.delete(`/api/v1/texts/delete/${id}`), { onSuccess: () => refetchDesign() })

  // sync form fields when selection changes
  useEffect(() => {
    if (selectedId) {
      const cur = texts.find((t) => t._id === selectedId)
      if (cur) {
        setInputValue(cur.text)
        onTextColorChange(cur.color || "#000000")
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

  // handlers
  const handleAdd = () => {
    addText.mutate({ text: inputValue, fontSize, offset: { x: 0, y: 0 }, isFront, color: textColor })
  }

  const handleUpdate = () => {
    const updatedText = {
      text: inputValue,
      fontSize,
      offset: texts.find((t) => t._id === selectedId).offset,
      isFront,
      color: textColor
    }

    if (designId) {
      // If design is saved in DB, update via mutation
      updateText.mutate({ id: selectedId, ...updatedText })
    } else {
      // Else, update local state
      setTexts((prev) => prev.map((t) => (t._id === selectedId ? { ...t, ...updatedText } : t)))
    }

    setSelectedId(null)
  }

  const handleDelete = () => {
    if (designId) {
      deleteText.mutate(selectedId)
    } else {
      setTexts((prev) => prev.filter((t) => t._id !== selectedId))
    }
    setSelectedId(null)
  }

  const selectText = (id) => setSelectedId((prev) => (prev === id ? null : id))

  const handleOffsetChange = (dx, dy) => {
    if (!selectedId) return
    setTexts((prev) => prev.map((t) => (t._id === selectedId ? { ...t, offset: { x: t.offset.x + dx, y: t.offset.y + dy } } : t)))
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
            key={t._id}
            onClick={() => selectText(t._id)}
            className={`px-2 py-1 rounded cursor-pointer truncate ${
              t._id === selectedId ? "bg-button-color font-medium" : "hover:bg-gray-100"
            }`}
          >
            {t.text} ({t.isFront ? "Front" : "Back"})
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
