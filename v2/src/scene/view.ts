import { create } from 'zustand'

type View = {
  /** Counts up each time the reset button is pressed; the camera rig watches it. */
  resetRequests: number
  requestReset: () => void
  /** The item under the pointer, if any (drives the hover card). */
  hoveredId: string | null
  setHovered: (id: string | null) => void
  /** The item whose detail popup is open, if any. */
  openId: string | null
  toggleOpen: (id: string) => void
  close: () => void
  /** An item tapped or clicked on the tree: shows its trash icon on touch screens, which have no hover. */
  selectedId: string | null
  toggleSelected: (id: string) => void
  /** The fruit being dragged, if any: its action icons hide until it's dropped. */
  draggingId: string | null
  setDragging: (id: string | null) => void
  /** True while the open popup is in edit mode: a stray click on empty space shouldn't throw edits away. */
  editing: boolean
  setEditing: (editing: boolean) => void
}

/**
 * UI state shared between the page and the 3D view (which lives inside the canvas and can't be reached
 * directly). Not persisted.
 */
export const useView = create<View>()(set => ({
  resetRequests: 0,
  requestReset: () => set(s => ({ resetRequests: s.resetRequests + 1 })),
  hoveredId: null,
  setHovered: id => set({ hoveredId: id }),
  openId: null,
  toggleOpen: id => set(s => s.editing ? s : ({ openId: s.openId === id ? null : id })),
  close: () => set({ openId: null, editing: false, selectedId: null }),
  draggingId: null,
  setDragging: id => set({ draggingId: id }),
  selectedId: null,
  toggleSelected: id => set(s => ({ selectedId: s.selectedId === id ? null : id })),
  editing: false,
  setEditing: editing => set({ editing }),
}))

/**
 * Where things are on screen right now (CSS px): centre and apparent radius. Written by 3D objects every frame,
 * read by page overlays (hover card, popup) every frame, so they stay pinned while the view moves.
 */
export const screenAnchors = new Map<string, { x: number, y: number, r: number, visible: boolean }>()

/** The live score (0–100) of the fruit being dragged, written every frame while dragging; read by the drag readout. */
export const liveScores = new Map<string, number>()
