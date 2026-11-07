import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils, type PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { angleDelta, cameraAzimuth, facingAzimuth, useView } from './view'
import { cameraDistanceFor, CAMERA_POLAR } from './world'

/** How far album view slides the picture right, as a fraction of the screen's width. */
const ALBUM_VIEW_SHIFT = 0.08
/** Seconds-ish for the glide; it eases out exponentially. */
const SPEED = 5

/**
 * The camera rig's glides: back to the starting viewpoint (front, starting distance) when the reset button is
 * pressed, or round to face a branch's plane (view.requestFace, from the catalog or the rater contents), keeping the distance.
 * Grabbing the board mid-glide cancels it, so it never fights the user. Also publishes the camera's turn
 * (cameraAzimuth) every frame.
 */
export const CameraReset = () => {
  const resetRequests = useView(s => s.resetRequests)
  const faceRequest = useView(s => s.faceRequest)
  const controls = useThree(s => s.controls) as OrbitControlsImpl | null
  const { camera, size } = useThree()
  /** Where the current glide is heading: a turn, and a distance (null: keep it). */
  const goal = useRef<{ azimuth: number, distance: number | null } | null>(null)

  useEffect(() => { if (resetRequests > 0) goal.current = { azimuth: 0, distance: cameraDistanceFor(size.width / size.height) } }, [resetRequests])
  useEffect(() => {
    if (faceRequest) goal.current = {
      azimuth: 'azimuth' in faceRequest ? faceRequest.azimuth : facingAzimuth(faceRequest.angle, cameraAzimuth.value),
      distance: null,
    }
  }, [faceRequest])

  useEffect(() => {
    if (!controls) return
    const cancel = () => { goal.current = null }
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls])

  // Album view: the picture slides right (a view offset, so the camera itself doesn't move and orbiting, dragging and
  // labels all still line up), easing in and out. Not on phones, where the album view shows only its title.
  const shift = useRef(0)
  useFrame((_, dt) => {
    const cam = camera as PerspectiveCamera
    const target = useView.getState().albumView && size.width > 640 ? size.width * ALBUM_VIEW_SHIFT : 0
    shift.current = MathUtils.damp(shift.current, target, 6, dt)
    if (Math.abs(shift.current) < 0.5 && target === 0) {
      shift.current = 0
      if (cam.view?.enabled) cam.clearViewOffset()
    } else cam.setViewOffset(size.width, size.height, -shift.current, 0, size.width, size.height)
  })

  useFrame((_, dt) => {
    if (!controls) return
    cameraAzimuth.value = controls.getAzimuthalAngle()
    const g = goal.current
    if (!g) return
    const k = 1 - Math.exp(-SPEED * dt)
    const azimuth = controls.getAzimuthalAngle()
    const distance = camera.position.distanceTo(controls.target)
    const targetDistance = g.distance ?? distance
    const nextAzimuth = azimuth + angleDelta(azimuth, g.azimuth) * k
    const nextDistance = distance + (targetDistance - distance) * k

    camera.position.set(
      Math.sin(CAMERA_POLAR) * Math.sin(nextAzimuth) * nextDistance,
      Math.cos(CAMERA_POLAR) * nextDistance,
      Math.sin(CAMERA_POLAR) * Math.cos(nextAzimuth) * nextDistance,
    ).add(controls.target)
    controls.update()

    if (Math.abs(angleDelta(nextAzimuth, g.azimuth)) < 0.002 && Math.abs(targetDistance - nextDistance) < 0.01) goal.current = null
  })

  return null
}
