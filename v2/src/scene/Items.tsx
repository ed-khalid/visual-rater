import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, Group, MathUtils, Vector3 } from 'three'
import { assignLanes } from '../state/layout'
import { Placement, useStore } from '../state/store'
import { theme } from '../theme'
import { AXIS_SPAN } from './Axis'
import { labelElements } from './labels'

const NODE_RADIUS = 0.16
/** Wide enough for a node plus a full label (labels are capped in CSS). */
const LANE_WIDTH = 3.6
const MIN_GAP = NODE_RADIUS * 2.6
const LABEL_OFFSET_PX = 16

/** Every item placed on the active board, laid out along the axis. */
export const Items = () => {
  const placements = useStore(s => s.placements)
  const activeBoardId = useStore(s => s.activeBoardId)
  const { viewport } = useThree()
  const height = viewport.height * AXIS_SPAN

  const nodes = useMemo(() => {
    const onBoard = placements.filter(p => p.boardId === activeBoardId)
    const ys = onBoard.map(p => (p.position - 0.5) * height)
    const lanes = assignLanes(ys, MIN_GAP)
    return onBoard.map((p, i) => ({ placement: p, x: lanes[i] * LANE_WIDTH, y: ys[i] }))
  }, [placements, activeBoardId, height])

  return <>{nodes.map(n => <ItemNode key={n.placement.itemId} placement={n.placement} x={n.x} y={n.y} />)}</>
}

type NodeProps = { placement: Placement, x: number, y: number }

/** A glowing node. Glides to its slot, flashes in when new, and keeps its DOM label pinned beside it. */
const ItemNode = ({ placement, x, y }: NodeProps) => {
  const group = useRef<Group>(null)
  const hot = useMemo(() => new Color(theme.signal).multiplyScalar(2.4), [])
  const bornAt = useRef(performance.now())
  const isNew = useRef(Date.now() - placement.placedAt < 1500).current
  const world = useMemo(() => new Vector3(), [])
  const { camera, size } = useThree()

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.position.x = MathUtils.damp(g.position.x, x, 8, dt)
    g.position.y = MathUtils.damp(g.position.y, y, 8, dt)
    const age = (performance.now() - bornAt.current) / 1000
    const scale = isNew ? Math.min(1, age * 6) * (1 + 0.6 * Math.exp(-age * 5) * Math.cos(age * 18)) : 1
    g.scale.setScalar(Math.max(0.01, scale))

    const label = labelElements.get(placement.itemId)
    if (label) {
      // Left-lane labels sit to the left of their node so they never cross the axis.
      const left = x < 0
      world.copy(g.position).project(camera)
      const px = (world.x + 1) / 2 * size.width + (left ? -LABEL_OFFSET_PX : LABEL_OFFSET_PX)
      const py = (1 - world.y) / 2 * size.height
      label.style.transform = `translate(${px}px, ${py}px) translate(${left ? '-100%' : '0'}, -50%)`
      label.style.textAlign = left ? 'right' : 'left'
      label.style.opacity = String(Math.min(1, scale))
    }
  })

  return <group ref={group} position={[0, y, 0.1]} scale={0.01}>
    <mesh>
      <ringGeometry args={[NODE_RADIUS * 0.82, NODE_RADIUS, 48]} />
      <meshBasicMaterial color={hot} toneMapped={false} />
    </mesh>
    <mesh>
      <circleGeometry args={[NODE_RADIUS * 0.82, 48]} />
      <meshBasicMaterial color={theme.void} />
    </mesh>
    <mesh>
      <circleGeometry args={[NODE_RADIUS * 0.28, 24]} />
      <meshBasicMaterial color={hot} toneMapped={false} />
    </mesh>
  </group>
}
