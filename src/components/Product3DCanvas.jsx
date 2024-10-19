import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"
import { Environment, OrbitControls, useGLTF } from "@react-three/drei"
// import { DirectionalLightHelper } from "three"
import { Leva, useControls } from "leva"

const Modal = ({ position, side, scale }) => {
  const ref = useRef()
  const { scene } = useGLTF("/models/shirt/shirt.gltf")

  useFrame((_state, delta, _frame) => {
    ref.current.rotation.y += delta * 1
  })

  return <primitive object={scene} position={position} ref={ref} scale={scale} />
}

const Scene = () => {
  const directionalLightRef = useRef()
  const { camera, gl } = useThree()

  const { lightColour, lightIntensity } = useControls({
    lightColour: "white",
    lightIntensity: {
      value: 0.5,
      min: 0,
      max: 5,
      step: 0.1
    }
  })

  return (
    <>
      <directionalLight position={[0, 1, 2]} intensity={lightIntensity} ref={directionalLightRef} color={lightColour} />
      <ambientLight intensity={0.5} />
      <Modal position={[1, -5, 1]} scale={4} />
      <Environment preset="apartment" background={true} />
      <OrbitControls args={[camera, gl.domElement]} enableZoom={false} />
    </>
  )
}

const Product3DCanvas = () => {
  return (
    <Canvas className="rounded-sm">
      <Leva hidden />
      <Scene />
    </Canvas>
  )
}

export default Product3DCanvas
