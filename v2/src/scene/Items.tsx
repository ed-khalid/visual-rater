import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, Group, MathUtils, Mesh, Vector3 } from 'three'
import { assignBranches, Branch } from '../state/layout'
import { Item, Placement, useStore } from '../state/store'
import { theme } from '../theme'
import { CoverSphere } from './CoverSphere'
import { labelElements, placeSideLabel, toScreen } from './labels'
import { NODE_RADIUS, positionToY } from './world'

/** Items closer than this in height must branch off in clearly different directions. */
const NEAR_Y = NODE_RADIUS * 3
/** A branch leaves the trunk this much lower than its fruit, so it rises out of the tree. */
const BRANCH_RISE = 0.35
const LABEL_OFFSET_PX = 12

/** Every item placed on the active board: a fruit on its own branch of the tree. */
export const Items = () => {
  const placements = useStore(s => s.placements)
  const items = useStore(s => s.items)
  const activeBoardId = useStore(s => s.activeBoardId)

  const nodes = useMemo(() => {
    // Placement order, so a new item never moves the branches already on the tree.
    const onBoard = placements.filter(p => p.boardId === activeBoardId && items[p.itemId]).sort((a, b) => a.placedAt - b.placedAt)
    const ys = onBoard.map(p => positionToY(p.position))
    const branches = assignBranches(ys, NEAR_Y)
    return onBoard.map((p, i) => ({ placement: p, item: items[p.itemId], y: ys[i], branch: branches[i] }))
  }, [placements, items, activeBoardId])

  return <>{nodes.map(n => <Fruit key={n.placement.itemId} item={n.item} placement={n.placement} y={n.y} branch={n.branch} />)}</>
}

type FruitProps = { item: Item, placement: Placement, y: number, branch: Branch }

/** Shortest signed turn from one angle to another, so a branch never spins the long way round. */
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

/**
 * One item. The group sits on the trunk at the fruit's height, turned to face the branch's direction; inside it a
 * thin glowing branch rises from the trunk to the fruit, and the fruit's cover faces outward along the branch.
 * Everything is fixed to the tree, so walking around it shows each fruit from the front, side or back.
 */
const Fruit = ({ item, placement, y, branch }: FruitProps) => {
  const group = useRef<Group>(null)
  const fruit = useRef<Group>(null)
  const stem = useRef<Mesh>(null)
  const glow = useMemo(() => new Color(theme.signal).multiplyScalar(1.3), [])
  const bornAt = useRef(performance.now())
  const isNew = useRef(Date.now() - placement.placedAt < 1500).current
  const state = useRef({ y, angle: branch.angle, length: isNew ? 0 : branch.length })
  const world = useMemo(() => new Vector3(), [])
  const trunk = useMemo(() => new Vector3(), [])
  const { camera, size } = useThree()

  useFrame((_, dt) => {
    const g = group.current, f = fruit.current, s = stem.current
    if (!g || !f || !s) return
    const st = state.current
    st.y = MathUtils.damp(st.y, y, 8, dt)
    st.angle += angleDelta(st.angle, branch.angle) * (1 - Math.exp(-8 * dt))
    st.length = MathUtils.damp(st.length, branch.length, isNew ? 6 : 8, dt)

    const age = (performance.now() - bornAt.current) / 1000
    const pop = isNew ? Math.min(1, age * 4) * (1 + 0.35 * Math.exp(-age * 5) * Math.cos(age * 16)) : 1

    g.position.set(0, st.y, 0)
    g.rotation.y = st.angle
    f.position.set(0, 0, st.length)
    f.scale.setScalar(Math.max(0.01, pop))
    // Stem: from the trunk (BRANCH_RISE lower) up to the fruit, in the group's local Y–Z plane.
    const run = Math.max(0.001, st.length - NODE_RADIUS * 0.9)
    s.position.set(0, -BRANCH_RISE / 2, run / 2)
    s.scale.set(1, Math.hypot(run, BRANCH_RISE), 1)
    s.rotation.x = Math.atan2(run, BRANCH_RISE)

    const label = labelElements.get(item.id)
    if (label) {
      world.set(Math.sin(st.angle) * st.length, st.y, Math.cos(st.angle) * st.length)
      trunk.set(0, st.y, 0)
      const p = toScreen(world, camera, size)
      const left = p.x < toScreen(trunk, camera, size).x - 1
      // Fruit behind the trunk (as seen from here) lose their labels, so the far side doesn't clutter the near.
      const behind = camera.position.distanceTo(world) - camera.position.distanceTo(trunk)
      const fade = MathUtils.clamp(1 - (behind + 0.2) / 0.6, 0, 1)
      const offset = LABEL_OFFSET_PX + (NODE_RADIUS / (camera.position.distanceTo(world) * 0.364)) * size.height / 2
      const w = label.offsetWidth
      const side = left ? !(p.x - offset - w < 0) : p.x + offset + w > size.width
      placeSideLabel(label, p.x, p.y, side, offset, Math.min(1, pop) * fade * (p.inFront ? 1 : 0))
    }
  })

  return <group ref={group} position={[0, y, 0]} rotation={[0, branch.angle, 0]}>
    <mesh ref={stem}>
      {/* unit-height cylinder, stretched to the branch's length each frame */}
      <cylinderGeometry args={[0.007, 0.012, 1, 6]} />
      <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.75} />
    </mesh>
    <group ref={fruit}>
      <CoverSphere image={item.image} radius={NODE_RADIUS} />
    </group>
  </group>
}
