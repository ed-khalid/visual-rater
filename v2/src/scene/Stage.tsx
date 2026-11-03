import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { useStore } from '../state/store'
import { theme } from '../theme'
import { Axis } from './Axis'
import { Backdrop } from './Backdrop'
import { CameraReset } from './CameraReset'
import { Effects } from './Effects'
import { Items } from './Items'
import { StagingArea } from './StagingArea'
import { useView } from './view'
import { cameraDistanceFor, CAMERA_FOV, CAMERA_MAX_DISTANCE, CAMERA_MIN_DISTANCE, CAMERA_POLAR } from './world'

/**
 * Full-screen 3D workspace. The camera orbits the vertical axis only: its elevation is fixed, so "up"
 * always means "better". Drag (or one finger) to turn the board, scroll or pinch to zoom.
 */
export const Stage = () => {
  const boardOpen = useStore(s => s.activeBoardId !== null)
  const distance = cameraDistanceFor(window.innerWidth / window.innerHeight)
  const start: [number, number, number] = [0, Math.cos(CAMERA_POLAR) * distance, Math.sin(CAMERA_POLAR) * distance]
  // A click on empty space closes an open popup, but not the end of a drag (orbiting), and not while editing.
  const down = useRef({ x: 0, y: 0 })
  const onPointerMissed = (e: MouseEvent) => {
    const v = useView.getState()
    if (!v.editing && Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) < 6) v.close()
  }
  return <Canvas
    onPointerDown={e => { down.current = { x: e.clientX, y: e.clientY } }}
    onPointerMissed={onPointerMissed}
    camera={{ position: start, fov: CAMERA_FOV, near: 0.1, far: 120 }}
    dpr={[1, 2]}
    gl={{ antialias: false }}
    style={{ position: 'fixed', inset: 0 }}
  >
    <color attach="background" args={[theme.void]} />
    <Backdrop />
    {boardOpen && <>
      <Axis />
      <Items />
      <StagingArea />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={CAMERA_POLAR}
        maxPolarAngle={CAMERA_POLAR}
        minDistance={CAMERA_MIN_DISTANCE}
        maxDistance={CAMERA_MAX_DISTANCE}
      />
      <CameraReset />
    </>}
    <Effects />
  </Canvas>
}
