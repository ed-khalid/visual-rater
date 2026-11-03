import { Canvas } from '@react-three/fiber'
import { useStore } from '../state/store'
import { theme } from '../theme'
import { Axis } from './Axis'
import { Backdrop } from './Backdrop'
import { Effects } from './Effects'
import { Items } from './Items'

/** Full-screen WebGL stage. Orthographic so it behaves like 2D; the 3D camera stays available later. */
export const Stage = () => {
  const boardOpen = useStore(s => s.activeBoardId !== null)
  return <Canvas
    orthographic
    camera={{ position: [0, 0, 20], zoom: 60 }}
    dpr={[1, 2]}
    gl={{ antialias: false }}
    style={{ position: 'fixed', inset: 0 }}
  >
    <color attach="background" args={[theme.void]} />
    <Backdrop />
    {boardOpen && <>
      <Axis />
      <Items />
    </>}
    <Effects />
  </Canvas>
}
