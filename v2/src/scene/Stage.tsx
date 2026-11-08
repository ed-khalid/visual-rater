import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useStore } from '../state/store'
import { theme } from '../theme'
import { Axis } from './Axis'
import { Backdrop } from './Backdrop'
import { CameraReset } from './CameraReset'
import { Effects } from './Effects'
import { Items } from './Items'
import { Nodes } from './Nodes'
import { Raters } from './Raters'
import { collapse, COLLAPSE_SECONDS, useView } from './view'
import { cameraDistanceFor, CAMERA_FOV, CAMERA_MIN_DISTANCE, CAMERA_POLAR } from './world'

/**
 * Full-screen 3D workspace. The camera orbits the vertical axis only: its elevation is fixed, so "up"
 * always means "better". Drag (or one finger) to turn the board, scroll or pinch to zoom; in split view, right-drag
 * (or two fingers) to pan along the floor. The zoom limit and panning are set every frame by CameraReset.
 */
export const Stage = () => {
  const boardOpen = useStore(s => s.activeType !== null)
  // The list view covers the tree, so there's nothing to draw while it's up.
  const listing = useView(v => v.phase === 'list')
  const distance = cameraDistanceFor(window.innerWidth / window.innerHeight)
  const start: [number, number, number] = [0, Math.cos(CAMERA_POLAR) * distance, Math.sin(CAMERA_POLAR) * distance]
  // A click on empty space closes an open popup, but not the end of a drag (orbiting), and not while editing.
  const down = useRef({ x: 0, y: 0 })
  const onPointerMissed = (e: MouseEvent) => {
    const v = useView.getState()
    if (v.editing || Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) >= 6) return
    // First click closes whatever's open; with nothing open, it leaves album view, or goes back to the artists.
    if (v.openId || v.selectedId) v.close()
    else if (v.albumView) v.setAlbumView(null)
    else if (v.drill) v.setDrill(null)
  }
  return <Canvas
    onPointerDown={e => { down.current = { x: e.clientX, y: e.clientY } }}
    onPointerMissed={onPointerMissed}
    camera={{ position: start, fov: CAMERA_FOV, near: 0.1, far: 300 }}
    dpr={[1, 2]}
    frameloop={listing ? 'never' : 'always'}
    gl={{ antialias: false }}
    style={{ position: 'fixed', inset: 0 }}
  >
    <color attach="background" args={[theme.void]} />
    <Backdrop />
    {boardOpen && <>
      <Axis />
      <CollapseDriver />
      <Raters />
      <Items />
      <Nodes />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={CAMERA_POLAR}
        maxPolarAngle={CAMERA_POLAR}
        minDistance={CAMERA_MIN_DISTANCE}
      />
      <CameraReset />
    </>}
    <Effects />
  </Canvas>
}

/** Eases `collapse` towards 1 whenever the list is on its way in or up, and back to 0 for the tree. */
const CollapseDriver = () => {
  const progress = useRef(collapse.value)
  useFrame((_, dt) => {
    const target = useView.getState().phase === 'tree' ? 0 : 1
    const step = Math.min(dt, 0.1) / COLLAPSE_SECONDS
    progress.current = target > progress.current ? Math.min(1, progress.current + step)
      : target < progress.current ? Math.max(0, progress.current - step) : target
    const p = progress.current
    collapse.value = p * p * (3 - 2 * p)
  })
  return null
}

