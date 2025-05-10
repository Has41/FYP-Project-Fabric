import { useEffect, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function ShirtModel({ position, scale, color, pattern, texts = [] }) {
  const shirtRef = useRef()
  const { scene } = useGLTF("/models/shirt/shirt.glb")

  // Bake pattern + multiple texts onto a canvas texture
  useEffect(() => {
    if (!scene) return

    const applyPatternWithTexts = async () => {
      const size = 1024
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = size
      const ctx = canvas.getContext("2d")

      // fill base
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, size, size)

      // apply pattern
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

      // draw each text
      for (const t of texts) {
        // choose UV region based on front/back
        const { isFront = true } = t
        const uMin = isFront ? 0.414 : 0.073
        const uMax = isFront ? 0.661 : 0.271
        const vMax = isFront ? 0.28 : 0.836
        const vMin = isFront ? 0.161 : 0.675

        const regionX = uMin * size
        const regionY = (1 - vMax) * size
        const regionW = (uMax - uMin) * size
        const regionH = (vMax - vMin) * size

        // measure text
        const fontSz = t.fontSize || 40
        ctx.font = `${fontSz}px sans-serif`
        const m = ctx.measureText(t.content)
        const textW = m.width
        const textH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
        const pad = 8
        const svgW = textW + pad * 2
        const svgH = textH + pad * 2

        // compute position
        const x = regionX + (regionW - svgW) * 0.5 + (t.offset.x || 0)
        const y = regionY + (regionH - svgH) * 0.5 + (t.offset.y || 0)

        // build SVG
        const ascent = m.actualBoundingBoxAscent
        const fg = t.color || "black"
        const bg = "white"
        const svg =
          `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${svgW}\" height=\"${svgH}\">` +
          `<style>text { font-family: sans-serif; font-size: ${fontSz}px; fill: ${fg}; }</style>` +
          `<rect width=\"100%\" height=\"100%\" fill=\"${bg}\"/>` +
          `<text x=\"${pad}\" y=\"${pad + ascent}\" dominant-baseline=\"alphabetic\">${t.content}</text>` +
          `</svg>`

        // optional debug outline
        // ctx.strokeStyle = "red"
        // ctx.lineWidth = 2
        // ctx.strokeRect(x, y, svgW, svgH)

        // render SVG
        const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
        await new Promise((res) => {
          const imgSVG = new Image()
          imgSVG.onload = () => {
            ctx.clearRect(x, y, svgW, svgH)
            ctx.save()
            ctx.translate(x + svgW / 2, y + svgH / 2)
            ctx.scale(1, -1)
            ctx.drawImage(imgSVG, -svgW / 2, -svgH / 2, svgW, svgH)
            ctx.restore()
            res()
          }
          imgSVG.onerror = () => res()
          imgSVG.src = uri
        })
      }

      // create Three texture
      const tex = new THREE.CanvasTexture(canvas)
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
      tex.needsUpdate = true

      // apply texture to meshes
      scene.traverse((c) => {
        if (c.isMesh) {
          c.material.map = tex
          c.material.needsUpdate = true
        }
      })
    }

    applyPatternWithTexts()
  }, [scene, pattern, texts])

  // apply base color
  useEffect(() => {
    if (!scene || !color) return
    scene.traverse((c) => {
      if (c.isMesh) {
        c.material.color = new THREE.Color(color)
        c.material.needsUpdate = true
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
