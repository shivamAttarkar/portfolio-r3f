import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { StarField } from "./components/StarField"

function App() {
  return <Canvas>
    <PerspectiveCamera makeDefault position={[10, 10, -10]} fov={20}></PerspectiveCamera>
    <OrbitControls enableZoom={true} enabled={true}></OrbitControls>
    <StarField></StarField>
    <axesHelper></axesHelper>
  </Canvas >
}

export default App;