import { Grid } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Fog, Mesh, ShaderMaterial } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { theme } from '../theme'
import { AXIS_BOTTOM, CAMERA_DISTANCE } from './world'

/** Fog starts at what the camera looks at and is thick this much further on (world units). */
const FOG_DEPTH = 26
const GRID_FADE = 34

/**
 * A faint infinite floor grid just below the axis, fading into fog. The fog and the grid's fade go by how far the
 * camera is from what it's looking at, so zooming out (split view's whole row of raters) doesn't fog everything.
 */
export const Backdrop = () => {
  const fog = useRef<Fog>(null)
  const grid = useRef<Mesh>(null)
  useFrame(({ camera, controls }) => {
    const target = (controls as OrbitControlsImpl | null)?.target
    const d = target ? camera.position.distanceTo(target) : CAMERA_DISTANCE
    if (fog.current) { fog.current.near = d; fog.current.far = d + FOG_DEPTH }
    const m = grid.current?.material as ShaderMaterial | undefined
    if (m?.uniforms?.fadeDistance) m.uniforms.fadeDistance.value = GRID_FADE + Math.max(0, d - CAMERA_DISTANCE)
  })
  return <>
    <fog ref={fog} attach="fog" args={[theme.void, CAMERA_DISTANCE, CAMERA_DISTANCE + FOG_DEPTH]} />
    <Grid
      ref={grid}
      position={[0, AXIS_BOTTOM - 0.6, 0]}
      infiniteGrid
      cellSize={0.5}
      cellThickness={0.6}
      cellColor={theme.grid}
      sectionSize={2.5}
      sectionThickness={1}
      sectionColor={theme.gridSection}
      fadeDistance={GRID_FADE}
      fadeStrength={1.6}
      followCamera={false}
    />
  </>
}
