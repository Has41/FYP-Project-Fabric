import { Canvas } from "@react-three/fiber"
import { useRef } from "react"
import { Environment, OrbitControls, useGLTF } from "@react-three/drei"
// import { DirectionalLightHelper } from "three"
import { Leva, useControls } from "leva"
// import { AxesHelper } from "three"

const Modal = ({ position, scale, color }) => {
  const ref = useRef()
  const { scene } = useGLTF("/models/shirt/shirt.gltf")
  scene.traverse((object) => {
    if (object.isMesh) {
      object.material.color.set(color)
    }
  })

  return <primitive object={scene} position={position} ref={ref} scale={scale} />
}

const Scene = ({ color }) => {
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

  const modelPosition = [0, 0, 0]

  return (
    <>
      <directionalLight position={[0, 1, 2]} intensity={lightIntensity} ref={directionalLightRef} color={lightColour} />
      <ambientLight intensity={0.5} />
      <Modal color={color} position={[0, -5, 0]} scale={4} />
      <Environment preset="apartment" background={true} />
      <OrbitControls target={modelPosition} maxDistance={10} minDistance={2} enableZoom={false} />
    </>
  )
}

const Product3DCanvas = ({ color }) => {
  return (
    <Canvas camera={{ position: [3, 0, 3] }} className="rounded-sm">
      <Leva hidden />
      <Scene color={color} />
    </Canvas>
  )
}

export default Product3DCanvas
