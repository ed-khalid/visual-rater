import { create } from 'zustand'

export type Phase = 'tree' | 'to-list' | 'list' | 'to-tree'

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
  /**
   * The tree (3D rater) or the list (a plain table of everything on the tree, best first), and the transitions
   * between them: to-list (branches and fruit sink into the trunk, then the list opens out from the trunk line),
   * to-tree (the list closes back into the line, then the branches grow out again).
   */
  phase: Phase
  /** Starts the transition to the other view; ignored while one is already running. */
  toggleMode: () => void
  setPhase: (phase: Phase) => void
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
  phase: 'tree',
  toggleMode: () => set(s => s.phase === 'tree'
    ? { phase: 'to-list', openId: null, editing: false, hoveredId: null, selectedId: null }
    : s.phase === 'list' ? { phase: 'to-tree' } : s),
  setPhase: phase => set({ phase }),
}))

/**
 * Where things are on screen right now (CSS px): centre and apparent radius. Written by 3D objects every frame,
 * read by page overlays (hover card, popup) every frame, so they stay pinned while the view moves.
 */
export const screenAnchors = new Map<string, { x: number, y: number, r: number, visible: boolean }>()

/** The live score (0–100) of the fruit being dragged, written every frame while dragging; read by the drag readout. */
export const liveScores = new Map<string, number>()

/** Key in screenAnchors for the top of the trunk (published by Axis), where the tree/list switch sits. */
export const TRUNK_TOP_ANCHOR = '__trunk-top'

/** Key in screenAnchors for the bottom of the trunk (published by Axis). */
export const TRUNK_BOTTOM_ANCHOR = '__trunk-bottom'

/**
 * How far the tree has sunk into its trunk for the list view: 0 = fully out, 1 = every branch and fruit drawn in.
 * Eased over COLLAPSE_SECONDS by the stage (CollapseDriver); read every frame by the fruit and floating spheres.
 */
export const collapse = { value: 0 }
/** The list view waits for the collapse to finish before it opens. */
export const COLLAPSE_SECONDS = 0.3
