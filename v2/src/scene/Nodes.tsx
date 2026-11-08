import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, Group, MathUtils, Mesh, PerspectiveCamera, Vector3 } from 'three'
import { albumNodes, artistNodes, type DrillNode, spreadNodes } from '../state/drill'
import { usePersisted, useStore } from '../state/store'
import { theme } from '../theme'
import { CoverSphere, SHAPE_EXTENT } from './CoverSphere'
import { labelElements, placeSideLabel, toScreen } from './labels'
import { useGlow } from './useGlow'
import { collapse, isSplit, LEVEL_DELAY_MS, levelChange, screenAnchors, useView } from './view'
import { NODE_RADIUS, positionToY } from './world'

/** Artists are drawn bigger than albums, which are the size of song fruit. */
const ARTIST_RADIUS = NODE_RADIUS * 2
const ALBUM_RADIUS = NODE_RADIUS * 1.6
const LABEL_OFFSET_PX = 12
const CLICK_SLOP_PX = 6

/** Key in labelElements and screenAnchors for a node (an album's own id is the catalog row's). */
export const nodeKey = (id: string) => `node:${id}`

/** The read-only rater's fruit, every level of it: the artists, and each artist's albums, with their branches. */
export const useDrillNodes = () => {
  const s = usePersisted()
  const music = useStore(st => st.activeType === 'music')
  const hidden = useView(v => v.hiddenAlbums)
  return useMemo(() => {
    if (!music) return []
    const artists = artistNodes(s, hidden)
    const out: { node: DrillNode, level: string | null, branch: { angle: number, length: number } }[] = []
    const spread = spreadNodes(artists, ARTIST_RADIUS)
    for (const a of artists) out.push({ node: a, level: null, branch: spread.get(a.id)! })
    for (const a of artists) {
      const albums = albumNodes(s, hidden, a.id), sp = spreadNodes(albums, ALBUM_RADIUS)
      for (const al of albums) out.push({ node: al, level: a.id, branch: sp.get(al.id)! })
    }
    return out
  }, [s, music, hidden])
}

/**
 * MUSIC's default view (state/drill.ts): a read-only rater, nothing on it can be dragged. Artists hang on it at their
 * score; click one and every artist draws back into the trunk, then that artist's albums come out (view.drill).
 * Clicking an album only logs it for now (view.logAction). Esc or a click on empty space goes back to the artists.
 * In split view, album view or the list view, none of this shows: the songs are on the tree instead.
 */
export const Nodes = () => <>{useDrillNodes().map(({ node, level, branch }) =>
  <NodeFruit key={`${level ?? ''}:${node.id}`} node={node} level={level} branch={branch} />)}</>

const NodeFruit = ({ node, level, branch }: { node: DrillNode, level: string | null, branch: { angle: number, length: number } }) => {
  const radius = node.kind === 'artist' ? ARTIST_RADIUS : ALBUM_RADIUS
  const group = useRef<Group>(null), fruit = useRef<Group>(null), stem = useRef<Mesh>(null)
  const state = useRef({ y: positionToY(node.position), angle: branch.angle, length: branch.length, shown: 0 })
  const dim = useRef(0)
  const glow = useGlow(useStore(s => node.kind === 'artist' ? s.artists[node.id] : s.albums[node.id]))
  const stemColor = useMemo(() => new Color(theme.signal).multiplyScalar(1.3), [])
  const world = useMemo(() => new Vector3(), [])
  const { camera, size } = useThree()
  const key = nodeKey(node.id)
  const unrated = node.score === undefined

  useFrame((_, dt) => {
    const g = group.current, f = fruit.current, s = stem.current
    if (!g || !f || !s) return
    const v = useView.getState(), st = state.current
    // Out on its branch only on its own level of the default view, and not until the last level has gone in.
    const active = v.drill === level && !v.albumView && !isSplit(v) && v.phase === 'tree'
      && performance.now() - levelChange.at > LEVEL_DELAY_MS
    st.shown = MathUtils.damp(st.shown, active ? 1 : 0, active ? 7 : 12, dt)
    st.y = MathUtils.damp(st.y, positionToY(node.position), 8, dt)
    st.angle = MathUtils.damp(st.angle, branch.angle, 8, dt)
    st.length = MathUtils.damp(st.length, branch.length, 8, dt)
    const out = (1 - collapse.value) * st.shown
    g.visible = out > 0.02
    const length = st.length * out
    g.position.set(0, st.y, 0)
    g.rotation.y = st.angle
    f.position.set(0, 0, length)
    f.scale.setScalar(Math.max(0.01, out))
    const run = Math.max(0.001, length - radius * SHAPE_EXTENT * out * 0.9)
    s.position.set(0, 0, run / 2)
    s.scale.set(1, run, 1)

    world.set(Math.sin(st.angle) * length, st.y, Math.cos(st.angle) * length)
    const p = toScreen(world, camera, size)
    const r = (radius * SHAPE_EXTENT * out / (camera.position.distanceTo(world) * Math.tan((camera as PerspectiveCamera).fov * Math.PI / 360))) * size.height / 2
    screenAnchors.set(key, { x: p.x, y: p.y, r, visible: p.inFront && out > 0.5 })
    const label = labelElements.get(key)
    if (label) {
      const left = Math.sin(st.angle) < 0
      placeSideLabel(label, p.x, p.y, left, LABEL_OFFSET_PX + r, (p.inFront ? 1 : 0) * out * out)
    }
  })

  const live = () => state.current.shown > 0.5
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_SLOP_PX || !live()) return
    e.stopPropagation()
    const v = useView.getState()
    if (node.kind === 'artist') v.setDrill(node.id)
    else v.logAction(`${node.name} album clicked`)
  }

  return <group ref={group} position={[0, state.current.y, 0]} rotation={[0, branch.angle, 0]}>
    <mesh ref={stem} rotation={[Math.PI / 2, 0, 0]}>
      {/* unit-height cylinder, stretched to the branch's length each frame */}
      <cylinderGeometry args={[0.007, 0.012, 1, 6]} />
      <meshBasicMaterial color={stemColor} toneMapped={false} transparent opacity={0.75} />
    </mesh>
    <group ref={fruit} onClick={onClick}
      onPointerOver={e => { if (!live()) return; e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = '' }}>
      <CoverSphere image={node.image} radius={radius} glow={glow} rimStrength={unrated ? 0.9 : 2.2} dim={dim} />
    </group>
  </group>
}
