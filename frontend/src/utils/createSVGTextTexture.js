import * as THREE from "three"

const createSVGTextTexture = ({
  text,
  fontSize = 64,
  fillStyle = "#000",
  bgColor = "rgba(255,255,255,0.8)",
  width = 512,
  height = 512,
  padding = 20
}) => {
  // SVG with a <rect> behind the <text>
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}"
            fill="${bgColor}" rx="10" ry="10"/>
      <text x="50%" y="50%"
            text-anchor="middle" dominant-baseline="middle"
            font-family="sans-serif"
            font-size="${fontSize}px"
            fill="${fillStyle}">
        ${text}
      </text>
    </svg>
  `.trim()

  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  const texture = new THREE.TextureLoader().load(uri)
  texture.needsUpdate = true
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

export default createSVGTextTexture
