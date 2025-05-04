import * as THREE from "three"

export default function createTextPlaneTexture({
  text,
  fontSizePx = 64,
  fillStyle = "#000",
  backgroundColor = "#fff",
  width = 1,
  height = 1
}) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = backgroundColor
  ctx.clearRect(0, 0, width, height)

  // draw centered text
  ctx.fillStyle = fillStyle
  ctx.font = `${fontSizePx}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, width / 2, height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearFilter
  return tex
}
