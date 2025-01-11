import { useEffect, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

const ShirtModel = ({ position, scale, color, pattern }) => {
  const { scene } = useGLTF("/models/shirt/shirt.glb")
  const textureRef = useRef(null)

  useEffect(() => {
    const loadSVGAsTexture = async () => {
      if (pattern) {
        const response = await fetch(pattern)
        const svgText = await response.text()
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml")
        const shapes = svgDoc.querySelectorAll("path")

        shapes.forEach((shape) => {
          if (!shape.getAttribute("stroke") || shape.getAttribute("stroke") === null) {
            shape.setAttribute("stroke", "#000")
          }
          if (!shape.getAttribute("stroke-width" || shape.getAttribute("stroke-width") === null)) {
            shape.setAttribute("stroke-width", "4")
          }
          if (shape.getAttribute("fill") === "none" || shape.getAttribute("fill") === null) {
            shape.setAttribute("fill", "#000")
          }
        })

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const size = 1024
        canvas.width = size
        canvas.height = size

        const img = new Image()
        img.src = `data:image/svg+xml;base64,${btoa(svgText)}`
        img.onload = () => {
          ctx.clearRect(0, 0, size, size)
          ctx.drawImage(img, 0, 0, size, size)

          const imageData = ctx.getImageData(0, 0, 1, 1)
          const [r, g, b, a] = imageData.data

          if (a === 0 || a === 255) {
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, size, size)
            ctx.drawImage(img, 0, 0, size, size)
          }

          const texture = new THREE.CanvasTexture(canvas)
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.repeat.set(20, 20)
          textureRef.current = texture
          applyTexture(texture)
        }
      } else {
        resetTexture()
      }
    }

    const resetTexture = () => {
      if (scene) {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.map = null
            child.material.needsUpdate = true
          }
        })
      }
    }

    const applyTexture = (texture) => {
      if (scene || texture) {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.material.map = texture
            child.material.transparent = false
            child.material.opacity = 1
            child.material.needsUpdate = true
          }
        })
      }
    }

    loadSVGAsTexture()
  }, [pattern, scene, color])

  useEffect(() => {
    if (color) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.color = new THREE.Color(color)
          child.material.needsUpdate = true
        }
      })
    }
  }, [color])

  if (!scene) return null

  return <primitive object={scene} position={position} scale={scale} />
}

export default ShirtModel
