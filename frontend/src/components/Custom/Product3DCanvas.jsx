import { useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { Leva, useControls } from "leva"
import { Environment, EnvironmentCube, OrbitControls } from "@react-three/drei"
import ShirtModel from "../Models/ShirtModel"

const Scene = ({ color, pattern, texts, onReadyCapture, graphics, activeTextId, setActiveTextId, textColor, textFontSize }) => {
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
      <directionalLight position={[5, 5, 5]} intensity={lightIntensity} ref={directionalLightRef} color={lightColour} />
      <ambientLight intensity={0.5} />
      <ShirtModel
        position={modelPosition}
        scale={3.5}
        color={color}
        pattern={pattern}
        onReadyCapture={onReadyCapture}
        texts={texts}
        graphics={graphics}
        onSelectText={setActiveTextId}
        activeTextId={activeTextId}
        textColor={textColor}
        textFontSize={textFontSize}
      />
      <Environment files="/hdrs/apartment.hdr" background={true} />
      {/* <Environment preset="apartment" background={true} /> */}
      <OrbitControls
        target={modelPosition}
        maxDistance={10}
        minDistance={2}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  )
}

const Product3DCanvas = ({
  color,
  pattern,
  texts,
  graphics,
  setTexts,
  onReadyCapture,
  activeTextId,
  setActiveTextId,
  textColor,
  textFontSize
}) => {
  return (
    <Canvas camera={{ position: [0, 0, 0] }} className="rounded-sm">
      <Leva hidden />
      <Scene
        color={color}
        pattern={pattern}
        activeTextId={activeTextId}
        setActiveTextId={setActiveTextId}
        texts={texts}
        onReadyCapture={onReadyCapture}
        graphics={graphics}
        setTexts={setTexts}
        textColor={textColor}
        textFontSize={textFontSize}
      />
    </Canvas>
  )
}

export default Product3DCanvas
