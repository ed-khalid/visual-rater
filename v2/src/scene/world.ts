/** Shared 3D world measurements (world units). The axis is vertical, centred on the origin. */
export const AXIS_HEIGHT = 8
export const AXIS_BOTTOM = -AXIS_HEIGHT / 2

/** Vertical field of view, and how far the camera orbits from the axis by default / at the limits of zoom. */
export const CAMERA_FOV = 40
export const CAMERA_DISTANCE = 14
/** Portrait phones see much less sideways, so they start further back to fit the ring beside the tray. */
export const CAMERA_DISTANCE_NARROW = 19
export const cameraDistanceFor = (aspect: number) => aspect < 0.8 ? CAMERA_DISTANCE_NARROW : CAMERA_DISTANCE
export const CAMERA_MIN_DISTANCE = 7
export const CAMERA_MAX_DISTANCE = 24

/** Camera elevation, fixed: orbiting is around the vertical axis only. Slightly above level, for depth. */
export const CAMERA_POLAR = Math.PI / 2 - 0.14

/** Size of an item sphere on the board. */
export const NODE_RADIUS = 0.26

/** Height on the axis for a placement position (0 bottom … 1 top). */
export const positionToY = (position: number) => AXIS_BOTTOM + position * AXIS_HEIGHT
