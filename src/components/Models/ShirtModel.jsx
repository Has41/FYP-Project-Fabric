import { useEffect, useRef, useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function ShirtModel({ position, scale, color, pattern, shirtText, textColor, textFontSize }) {
  const shirtRef = useRef()
  const { scene } = useGLTF("/models/shirt/shirt.glb")

  // useEffect(() => {
  //   if (!scene) return

  //   const applyPatternAndText = async () => {
  //     const size = 1024
  //     const canvas = document.createElement("canvas")
  //     canvas.width = canvas.height = size
  //     const ctx = canvas.getContext("2d")

  //     ctx.fillStyle = "white"
  //     ctx.fillRect(0, 0, size, size)

  //     if (pattern) {
  //       try {
  //         const response = await fetch(pattern)
  //         const svgText = await response.text()
  //         const img = new Image()
  //         img.src = `data:image/svg+xml;base64,${btoa(svgText)}`
  //         await new Promise((res) => (img.onload = res))

  //         const patternFill = ctx.createPattern(img, "repeat")
  //         ctx.fillStyle = patternFill
  //         ctx.fillRect(0, 0, size, size)
  //       } catch (err) {
  //         console.warn("Pattern load failed", err)
  //       }
  //     }

  //     if (shirtText) {
  //       ctx.fillStyle = textColor || "black"
  //       ctx.font = `480px sans-serif`
  //       ctx.fillStyle = "black"
  //       ctx.fillText("TEST", size / 2, size / 2)
  //       ctx.textAlign = "center"
  //       ctx.textBaseline = "middle"
  //     }

  //     const finalTex = new THREE.CanvasTexture(canvas)
  //     finalTex.wrapS = THREE.RepeatWrapping
  //     finalTex.wrapT = THREE.RepeatWrapping
  //     finalTex.repeat.set(20, 20)
  //     finalTex.needsUpdate = true

  //     scene.traverse((child) => {
  //       if (child.isMesh) {
  //         child.material = new THREE.MeshStandardMaterial({
  //           map: finalTex,
  //           color: new THREE.Color(color || "#ffffff"),
  //           transparent: true
  //         })
  //         child.material.map.needsUpdate = true
  //         child.material.needsUpdate = true
  //       }
  //     })
  //   }

  //   applyPatternAndText()
  // }, [scene, pattern, shirtText, textColor, textFontSize])

  useEffect(() => {
    if (!scene) return

    const applyPatternWithText = async () => {
      const size = 1024
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = size
      const ctx = canvas.getContext("2d")

      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, size, size)

      if (pattern) {
        const resp = await fetch(pattern)
        const svg = await resp.text()
        const img = new Image()
        img.src = `data:image/svg+xml;base64,${btoa(svg)}`
        await new Promise((r) => (img.onload = r))

        const pat = ctx.createPattern(img, "repeat")
        ctx.fillStyle = pat
        ctx.fillRect(0, 0, size, size)
      }

      if (shirtText) {
        //Backside
        // const uMin = 0.073
        // const uMax = 0.271
        // const vMax = 0.836
        // const vMin = 0.675
        //Frontside
        const uMin = 0.414
        const uMax = 0.661 //Increase or decrease top
        const vMax = 0.28 //Increase or decrease bottom
        const vMin = 0.161

        const x = uMin * size
        const y = (1 - vMax) * size
        const w = (uMax - uMin) * size
        const h = (vMax - vMin) * size

        // 2) Optional: draw a semitransparent box for contrast
        // ctx.fillStyle = "rgba(255,255,255,0.1)"
        ctx.fillRect(x, y, w, h)

        // 3) Optional: debug border
        ctx.strokeStyle = "red"
        ctx.lineWidth = 4
        ctx.strokeRect(x, y, w, h)

        // 4) draw text centered, with proper orientation
        ctx.save()

        // move origin to bottom‐center of the box
        ctx.translate(x + w / 2, y + h)
        // flip Y so text is upright on the model
        ctx.scale(1, -1)
        // if you need rotation, do it *after* scale:
        // ctx.rotate(Math.PI/180 * 10)  // 10° tilt

        // draw! use a little Y offset if you want it lifted:
        ctx.fillStyle = textColor || "black"
        ctx.font = `40px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(shirtText, 0, 25)

        ctx.restore()
      }

      const finalTex = new THREE.CanvasTexture(canvas)
      finalTex.wrapS = finalTex.wrapT = THREE.ClampToEdgeWrapping
      finalTex.needsUpdate = true

      scene.traverse((c) => {
        if (c.isMesh) {
          c.material.map = finalTex
          c.material.needsUpdate = true
        }
      })
    }

    applyPatternWithText()
  }, [scene, pattern, shirtText, textColor, textFontSize])

  useEffect(() => {
    if (!scene || !color) return
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.color = new THREE.Color(color)
        child.material.needsUpdate = true
      }
    })
  }, [scene, color])

  if (!scene) return null

  return (
    <group position={position} scale={scale}>
      <primitive ref={shirtRef} object={scene} />
    </group>
  )
}
