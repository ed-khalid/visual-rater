import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils, type PerspectiveCamera, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { rowBounds, splitLayout } from '../state/split'
import { useStore } from '../state/store'
import { angleDelta, cameraAzimuth, facingAzimuth, isSplit, useView } from './view'
import { cameraDistanceFor, CAMERA_FOV, CAMERA_MAX_DISTANCE, CAMERA_MIN_DISTANCE, CAMERA_POLAR, SPLIT_MAX_DISTANCE } from './world'

/** Room left round the row when the camera fits it (world units, each side): the scale on the left, names on the right. */
const FIT_MARGIN = 1.2

/** Wide screens keep this much of each side (CSS px) for the HUD's columns (unrated albums, the catalog). */
const SIDE_PANEL_PX = 270

/** Where the camera looks, and from how far, to see the whole row of raters (split view) from the front, between the side columns. */
const fitRow = (size: { width: number, height: number }) => {
  const aspect = (size.width > 900 ? size.width - 2 * SIDE_PANEL_PX : size.width) / size.height
  const v = useView.getState()
  const b = rowBounds(splitLayout(useStore.getState(), v.hiddenAlbums, v.raterPlaces))
  const halfWidth = (b.maxX - b.minX) / 2 + FIT_MARGIN
  const tan = Math.tan((CAMERA_FOV * Math.PI) / 360)
  const distance = halfWidth / (tan * aspect) + (b.maxZ - b.minZ) / 2
  return {
    target: new Vector3((b.minX + b.maxX) / 2, 0, (b.minZ + b.maxZ) / 2),
    distance: MathUtils.clamp(Math.max(cameraDistanceFor(size.width / size.height), distance), CAMERA_MIN_DISTANCE, SPLIT_MAX_DISTANCE),
  }
}

/** How far album view slides the picture right, as a fraction of the screen's width. */
const ALBUM_VIEW_SHIFT = 0.08
/** Seconds-ish for the glide; it eases out exponentially. */
const SPEED = 5

/**
 * The camera rig's glides: back to the starting viewpoint (front, starting distance) when the reset button is
 * pressed, or round to face a branch's plane (view.requestFace, from the catalog or the rater contents), keeping the distance.
 * In split view, home is the front of the whole row of raters, far enough back to see them all; the camera can pan
 * (along the floor) and zoom out further. Going into split view glides there; coming out glides back to the tree.
 * Grabbing the board mid-glide cancels it, so it never fights the user. Also publishes the camera's turn
 * (cameraAzimuth) every frame.
 */
export const CameraReset = () => {
  const resetRequests = useView(s => s.resetRequests)
  const faceRequest = useView(s => s.faceRequest)
  const controls = useThree(s => s.controls) as OrbitControlsImpl | null
  const { camera, size } = useThree()
  /** Where the current glide is heading: a turn, a distance and a point to look at (null: keep it). */
  const goal = useRef<{ azimuth: number | null, distance: number | null, target: Vector3 | null } | null>(null)
  const home = () => {
    const aspect = size.width / size.height
    return isSplit(useView.getState()) ? fitRow(size) : { target: new Vector3(), distance: cameraDistanceFor(aspect) }
  }
  const split = useView(isSplit)

  useEffect(() => { if (resetRequests > 0) goal.current = { azimuth: 0, ...home() } }, [resetRequests])
  useEffect(() => {
    if (faceRequest) goal.current = {
      ...(goal.current ?? { distance: null, target: null }),
      azimuth: 'azimuth' in faceRequest ? faceRequest.azimuth : facingAzimuth(faceRequest.angle, cameraAzimuth.value),
    }
  }, [faceRequest])
  // Into split view: to the front of the row. Out of it: back to the tree (album view turns the camera itself).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    goal.current = { azimuth: split ? 0 : goal.current?.azimuth ?? null, ...home() }
  }, [split])

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
    const splitNow = isSplit(useView.getState())
    controls.enablePan = splitNow
    controls.screenSpacePanning = false
    const limit = splitNow ? SPLIT_MAX_DISTANCE : CAMERA_MAX_DISTANCE
    const g = goal.current
    // Mid-glide the zoom limit gives way, so coming back from far out is a glide, not a jump.
    controls.maxDistance = g ? Math.max(limit, camera.position.distanceTo(controls.target) + 0.01) : limit
    if (!g) return
    const k = 1 - Math.exp(-SPEED * dt)
    if (g.target) {
      const step = g.target.clone().sub(controls.target).multiplyScalar(k)
      controls.target.add(step)
      camera.position.add(step)
    }
    const azimuth = controls.getAzimuthalAngle()
    const distance = camera.position.distanceTo(controls.target)
    const targetDistance = g.distance ?? distance
    const nextAzimuth = azimuth + angleDelta(azimuth, g.azimuth ?? azimuth) * k
    const nextDistance = distance + (targetDistance - distance) * k

    camera.position.set(
      Math.sin(CAMERA_POLAR) * Math.sin(nextAzimuth) * nextDistance,
      Math.cos(CAMERA_POLAR) * nextDistance,
      Math.sin(CAMERA_POLAR) * Math.cos(nextAzimuth) * nextDistance,
    ).add(controls.target)
    controls.update()

    if (Math.abs(angleDelta(nextAzimuth, g.azimuth ?? nextAzimuth)) < 0.002 && Math.abs(targetDistance - nextDistance) < 0.01
      && (!g.target || g.target.distanceTo(controls.target) < 0.01)) goal.current = null
  })

  return null
}
