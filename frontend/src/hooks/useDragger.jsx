import { useState, useEffect, useRef } from "react"

const useDragger = (modalRef, containerRef) => {
  const [isDragging, setIsDragging] = useState(false)
  const cursor = useRef({ x: null, y: null })
  const modal = useRef({
    dom: null,
    transformX: 0,
    transformY: 0
  })

  const onMouseMove = (e) => {
    if (!modal.current.dom) return

    const currentCursor = {
      x: e.clientX,
      y: e.clientY
    }

    const distance = {
      x: currentCursor.x - cursor.current.x,
      y: currentCursor.y - cursor.current.y
    }

    let newTransformX = modal.current.transformX + distance.x
    let newTransformY = modal.current.transformY + distance.y

    const modalRect = modal.current.dom.getBoundingClientRect()
    const section = containerRef.current
    const sectionRect = section?.getBoundingClientRect()

    const maxX = sectionRect?.width - modalRect?.width
    const minX = 0
    const maxY = sectionRect?.height / 2 - modalRect?.height / 2
    const minY = modalRect?.height / 2 - sectionRect?.height / 2

    newTransformX = Math.max(minX, Math.min(newTransformX, maxX))
    newTransformY = Math.max(minY, Math.min(newTransformY, maxY))

    modal.current.dom.style.transform = `translate(${newTransformX}px, ${newTransformY}px)`
  }

  const onMouseUp = () => {
    if (!modal?.current.dom || !containerRef.current) return
    setIsDragging(false)

    modal.current.dom.classList.remove("cursor-grab")
    modal.current.dom = null

    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (modalRef.current && modalRef.current.contains(e.target)) {
        setIsDragging(true)
        cursor.current = {
          x: e.clientX,
          y: e.clientY
        }

        const computedStyle = getComputedStyle(modalRef.current)
        const transform = computedStyle.transform

        if (transform !== "none") {
          const matrix = new DOMMatrix(transform)
          modal.current.transformX = matrix.m41 // x-coordinate
          modal.current.transformY = matrix.m42 // y-coordinate
        } else {
          modal.current.transformX = 0
          modal.current.transformY = 0
        }

        modal.current.dom = modalRef.current
        modal.current.dom.classList.add("cursor-grab")

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
      }
    }

    // if (containerRef?.current) {
    document.addEventListener("mousedown", handleMouseDown)
    // }

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [modalRef, containerRef]) // Dependency array includes the modalRef and containerRef
  return { isDragging }
}

export default useDragger
