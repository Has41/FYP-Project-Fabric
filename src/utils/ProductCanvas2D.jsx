import React, { useEffect, useRef } from "react"
import { fabric } from "fabric"
import testImg from "../assets/test1.png" // Ensure you are using an appropriate image file

const ProductCanvas2D = ({ selectedColor }) => {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const canvasEl = canvasRef.current

    if (!canvasEl) {
      console.error("Canvas element not found.")
      return
    }

    const canvas = new fabric.Canvas(canvasEl, {
      width: 480,
      height: 550
    })

    const imgElement = new Image()
    imgElement.src = testImg
    imgElement.crossOrigin = "anonymous"

    const desiredWidth = 700
    const desiredHeight = 500

    const scaleX = desiredWidth / imgElement.width
    const scaleY = desiredHeight / imgElement.height

    const img = new fabric.Image(imgElement, {
      left: (canvas.width - desiredWidth) / 2,
      top: (canvas.height - desiredHeight) / 2,
      scaleX: scaleX,
      scaleY: scaleY,
      selectable: false
    })

    imageRef.current = img
    canvas.add(img)
    canvas.renderAll()

    imgElement.onerror = () => {
      console.error("Error loading image!")
    }

    return () => {
      canvas.dispose()
    }
  }, [])

  useEffect(() => {
    if (imageRef.current && selectedColor) {
      try {
        const img = imageRef.current
        img.filters = []

        const tintColorFilter = new fabric.Image.filters.BlendColor({
          color: selectedColor || null,
          mode: "tint",
          alpha: 0.7
        })

        img.filters.push(tintColorFilter)
        img.applyFilters()
        img.canvas.renderAll()
      } catch (error) {
        console.error("Error applying filters to the image:", error.message)
      }
    }
  }, [selectedColor])

  return <canvas ref={canvasRef} />
}

export default ProductCanvas2D
