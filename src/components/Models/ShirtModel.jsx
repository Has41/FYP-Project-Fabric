import { useEffect, useRef, useState } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"

export default function ShirtModel({ position, scale, color, pattern, texts = [], graphics = [], onReadyCapture }) {
  const shirtRef = useRef()
  const { gl, camera } = useThree()
  const { scene } = useGLTF("/models/shirt/shirt.glb")
  const [saveRequested, setSaveRequested] = useState(false)
  const saveResolver = useRef(null)

  // Bake pattern + multiple texts + graphics onto a canvas texture
  useEffect(() => {
    if (!scene) return

    const applyPatternWithAssets = async () => {
      const size = 1024
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = size
      const ctx = canvas.getContext("2d")

      // fill base
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, size, size)

      // apply pattern
      if (pattern) {
        const resp = await fetch(pattern?.image?.url)
        const svgPat = await resp.text()
        const imgPat = new Image()
        imgPat.src = `data:image/svg+xml;base64,${btoa(svgPat)}`
        await new Promise((r) => (imgPat.onload = r))

        // Create pattern
        const pat = ctx.createPattern(imgPat, "repeat")

        const scaleFactor = size / (imgPat.width * 25)
        const patternScale = new DOMMatrix().scale(scaleFactor, scaleFactor)
        pat.setTransform(patternScale)

        ctx.fillStyle = pat
        ctx.fillRect(0, 0, size, size)
      }

      // helper to get UV region
      const getRegion = (isFront) => {
        const uMin = isFront ? 0.414 : 0.073
        const uMax = isFront ? 0.661 : 0.271
        const vMax = isFront ? 0.28 : 0.836
        const vMin = isFront ? 0.161 : 0.675
        const regionX = uMin * size
        const regionY = (1 - vMax) * size
        const regionW = (uMax - uMin) * size
        const regionH = (vMax - vMin) * size
        return { regionX, regionY, regionW, regionH }
      }

      // draw each text
      for (const t of texts) {
        const { regionX, regionY, regionW, regionH } = getRegion(t.isFront)
        const fontSz = t.fontSize || 40
        ctx.font = `${fontSz}px sans-serif`
        const m = ctx.measureText(t.text)
        const textW = m.width
        const textH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
        const pad = 8
        const svgW = textW + pad * 2
        const svgH = textH + pad * 2
        const x = regionX + (regionW - svgW) * 0.5 + (t.offset.x || 0)
        const y = regionY + (regionH - svgH) * 0.5 + (t.offset.y || 0)
        const ascent = m.actualBoundingBoxAscent
        const fg = t.color || "black"
        const bg = "white"
        const svg =
          `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${svgW}\" height=\"${svgH}\">` +
          `<style>text { font-family: sans-serif; font-size: ${fontSz}px; fill: ${fg}; }</style>` +
          `<rect width=\"100%\" height=\"100%\" fill=\"${bg}\"/>` +
          `<text x=\"${pad}\" y=\"${pad + ascent}\" dominant-baseline=\"alphabetic\">${t.text}</text>` +
          `</svg>`
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

      // draw each graphic as direct images
      for (const g of graphics) {
        const { regionX, regionY, regionW, regionH } = getRegion(g.isFront)
        // size can be dynamic or user-controlled
        const w = g.width || regionW * 0.5
        const h = g.height || regionH * 0.5
        const x = regionX + (regionW - w) * 0.5 + (g.offset.x || 0)
        const y = regionY + (regionH - h) * 0.5 + (g.offset.y || 0)

        await new Promise((res) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            ctx.save()
            ctx.translate(x + w / 2, y + h / 2)
            ctx.scale(1, -1)
            ctx.drawImage(img, -w / 2, -h / 2, w, h)
            ctx.restore()
            res()
          }
          img.onerror = () => res()
          img.src = g?.url ? g.url : g?.graphic?.url
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

    applyPatternWithAssets()
  }, [scene, pattern, texts, graphics])

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

  // useEffect(() => {
  //   if (!scene || !onReadyCapture) return

  //   onReadyCapture(() => {
  //     camera.position.set(0, 0, 2)
  //     camera.lookAt(0, 0, 0)
  //     // (b) Force a render pass:
  //     gl.render(scene, camera)
  //     // (c) Grab the PNG data URL:
  //     return gl.domElement.toDataURL("image/png")
  //   })
  // }, [scene, gl, camera, onReadyCapture])

  useEffect(() => {
    if (!scene || !onReadyCapture) return

    onReadyCapture(() => {
      return new Promise((resolve) => {
        // push the render + capture to the next browser repaint
        requestAnimationFrame(() => {
          // (a) reposition your camera if needed
          camera.position.set(0, 0, 2)
          camera.lookAt(0, 0, 0)

          // (b) force a render pass:
          gl.render(scene, camera)

          // (c) read out the pixels
          const dataUrl = gl.domElement.toDataURL("image/png")
          resolve(dataUrl)
        })
      })
    })
  }, [scene, gl, camera, onReadyCapture])

  if (!scene) return null

  return (
    <group position={position} scale={scale}>
      <primitive ref={shirtRef} object={scene} />
    </group>
  )
}
