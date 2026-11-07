import type { Camera } from 'three'
import { Vector3 } from 'three'

/**
 * Label elements by item id. The DOM label layer registers them; nodes in the canvas
 * move them each frame. Keeps labels as plain DOM in one React root, without drei's per-label roots.
 */
export const labelElements = new Map<string, HTMLElement>()

/** Score scale labels on the trunk (0, 10, … 100), by value. Registered by ItemLabels, placed by Axis. */
export const scaleElements = new Map<number, HTMLElement>()

const v = new Vector3()

/** Screen position (CSS px) of a world point. */
export const toScreen = (world: Vector3, camera: Camera, size: { width: number, height: number }) => {
  v.copy(world).project(camera)
  return { x: (v.x + 1) / 2 * size.width, y: (1 - v.y) / 2 * size.height, inFront: v.z < 1 }
}

/** Pin a label beside a point: to its right, or to its left (text right-aligned). */
export const placeSideLabel = (el: HTMLElement, x: number, y: number, left: boolean, offset: number, opacity: number) => {
  el.style.transform = `translate(${x + (left ? -offset : offset)}px, ${y}px) translate(${left ? '-100%' : '0'}, -50%)`
  el.style.textAlign = left ? 'right' : 'left'
  el.style.opacity = String(opacity)
}
