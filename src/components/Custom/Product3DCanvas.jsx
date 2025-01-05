import { useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { Leva, useControls } from "leva"
import ShirtModel from "../Models/ShirtModel"

const Scene = ({ color, pattern }) => {
  const directionalLightRef = useRef()

  const { lightColour, lightIntensity } = useControls({
    lightColour: "white",
    lightIntensity: {
      value: 0.5,
      min: 0,
      max: 5,
      step: 0.1
    }
  })

  const modelPosition = [0, 0, 0] // Lower the Y value further

  return (
    <>
      <directionalLight position={[5, 5, 5]} intensity={lightIntensity} ref={directionalLightRef} color={lightColour} />
      <ambientLight intensity={0.5} />
      <ShirtModel position={modelPosition} scale={3.5} color={color} pattern={pattern} />
      <Environment preset="apartment" background={true} />
      <OrbitControls
        target={modelPosition}
        maxDistance={10}
        minDistance={2}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
      {/* <axesHelper args={[5]} /> */}
    </>
  )
}

const Product3DCanvas = ({ color, pattern }) => {
  return (
    <Canvas camera={{ position: [0, 0, 0] }} className="rounded-sm">
      <Leva hidden />
      <Scene color={color} pattern={pattern} />
    </Canvas>
  )
}

export default Product3DCanvas
