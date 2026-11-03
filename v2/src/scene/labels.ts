/**
 * Label elements by item id. The DOM label layer registers them; nodes in the canvas
 * move them each frame. Keeps labels as plain DOM in one React root, without drei's per-label roots.
 */
export const labelElements = new Map<string, HTMLElement>()
