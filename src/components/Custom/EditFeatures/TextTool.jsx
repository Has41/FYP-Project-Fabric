import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"

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
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [isFront, setIsFront] = useState(true)

  // 1️⃣ Fetch from API and sync local `texts` state
  const { data: fetched = [], isLoading } = useQuery(
    "texts",
    () => axiosInstance.get("/api/v1/texts/user").then((res) => res.data.data),
    {
      onSuccess: (data) => {
        // map API shape to local TextItem shape
        const mapped = data.map((t) => ({
          id: t._id,
          content: t.text,
          color: t.color || "#000000",
          fontSize: t.fontSize,
          offset: t.offset,
          isFront: t.isFront
        }))
        setTexts(mapped)
      }
    }
  )

  // 2️⃣ Mutations
  const addText = useMutation(
    (payload) => axiosInstance.post("/api/v1/texts/add", payload),
    {
      onSuccess: () => queryClient.invalidateQueries("texts")
    },
    {
      onError: (error) => {
        console.error("Error adding text:", error)
      }
    }
  )
  const updateText = useMutation(({ id, ...body }) => axiosInstance.put(`/api/v1/texts/update/${id}`, body), {
    onSuccess: () => queryClient.invalidateQueries("texts")
  })
  const deleteText = useMutation((id) => axiosInstance.delete(`/api/v1/texts/delete/${id}`), {
    onSuccess: () => queryClient.invalidateQueries("texts")
  })

  // 3️⃣ Sync form with selection
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

  // 4️⃣ Handlers call API and update offsets locally
  const handleAdd = () => {
    addText.mutate({
      text: inputValue,
      fontSize,
      offset: { x: 0, y: 0 },
      isFront
    })

    setSelectedId(null)
    // closePopup()
  }
  const handleUpdate = () => {
    updateText.mutate({
      id: selectedId,
      text: inputValue,
      fontSize,
      offset: texts.find((t) => t.id === selectedId).offset,
      isFront
    })
    setSelectedId(null)
    // closePopup()
  }
  const handleDelete = () => {
    deleteText.mutate(selectedId)
    // setSelectedId(null)
  }
  const selectText = (id) => setSelectedId((prev) => (prev === id ? null : id))

  // retain original offset-only change
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

      {isLoading && <p>Loading...</p>}

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

export default TextTool
