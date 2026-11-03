import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useView } from './view'
import { cameraDistanceFor, CAMERA_POLAR } from './world'

/** Seconds-ish for the glide home; it eases out exponentially. */
const SPEED = 5

/** Shortest signed turn from one angle to another. */
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

/**
 * Glides the camera back to its starting viewpoint (front, starting distance) when the reset button is pressed.
 * Grabbing the board mid-glide cancels it, so it never fights the user.
 */
export const CameraReset = () => {
  const resetRequests = useView(s => s.resetRequests)
  const controls = useThree(s => s.controls) as OrbitControlsImpl | null
  const { camera, size } = useThree()
  const active = useRef(false)

  useEffect(() => { if (resetRequests > 0) active.current = true }, [resetRequests])

  useEffect(() => {
    if (!controls) return
    const cancel = () => { active.current = false }
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  useFrame((_, dt) => {
    if (!active.current || !controls) return
    const k = 1 - Math.exp(-SPEED * dt)
    const azimuth = controls.getAzimuthalAngle()
    const distance = camera.position.distanceTo(controls.target)
    const targetDistance = cameraDistanceFor(size.width / size.height)
    const nextAzimuth = azimuth + angleDelta(azimuth, 0) * k
    const nextDistance = distance + (targetDistance - distance) * k

    camera.position.set(
      Math.sin(CAMERA_POLAR) * Math.sin(nextAzimuth) * nextDistance,
      Math.cos(CAMERA_POLAR) * nextDistance,
      Math.sin(CAMERA_POLAR) * Math.cos(nextAzimuth) * nextDistance,
    ).add(controls.target)
    controls.update()

    if (Math.abs(angleDelta(nextAzimuth, 0)) < 0.002 && Math.abs(targetDistance - nextDistance) < 0.01) active.current = false
  })

  return null
}
