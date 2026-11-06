import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, type Mesh, Quaternion, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector3 } from 'three'
import { theme } from '../theme'

const loader = new TextureLoader().setCrossOrigin('anonymous')
const textures = new Map<string, Promise<Texture>>()

/** A cover's texture, loaded once per URL and shared by every sphere (and the glow colour picker) that uses it. */
export const loadCover = (url: string): Promise<Texture> => {
  if (!textures.has(url)) {
    const load = loader.loadAsync(url).then(t => { t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t })
    load.catch(() => textures.delete(url))
    textures.set(url, load)
  }
  return textures.get(url)!
}

/** Loads (once per URL) and returns a cover texture, or null until it's ready or if it fails. */
const useCoverTexture = (url?: string) => {
  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    if (!url) return setTexture(null)
    let cancelled = false
    loadCover(url).then(t => { if (!cancelled) setTexture(t) }, () => {})
    return () => { cancelled = true }
  }, [url])
  return texture
}

/**
 * A glass-like orb with its cover fixed to it, on both halves: the front half (around the sphere's local +Z) and the
 * back half each show the whole cover, wrapped around that half and stretched sideways until the two meet at the
 * sides, where they blend softly. Each half is oriented to read correctly from its own side (the back isn't
 * mirrored). Turn the sphere and the covers turn with it. A fresnel rim (view-dependent) catches the bloom.
 * Without a cover, it's a softly glowing core.
 */
const vertexShader = /* glsl */`
  varying vec3 vObjectNormal;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vObjectNormal = normal;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`
const fragmentShader = /* glsl */`
  uniform sampler2D map;
  uniform float hasMap;
  uniform vec3 core;
  uniform vec3 rim;
  uniform float rimStrength;
  uniform float dim;
  varying vec3 vObjectNormal;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 on = normalize(vObjectNormal);
    vec3 n = normalize(vNormal);
    vec3 v = normalize(-vViewPosition);
    float facing = max(dot(n, v), 0.0);

    vec3 col;
    if (hasMap > 0.5) {
      const float PI = 3.14159265;
      // Angle around the vertical axis: 0 at the front centre, ±PI/2 at the sides, ±PI at the back centre.
      float az = atan(on.x, on.z);
      // Same angle measured from the back centre, so the back half runs 0→1 left-to-right as seen from behind.
      float azBack = az > 0.0 ? az - PI : az + PI;
      float v = on.y * 0.5 + 0.5;
      vec3 front = texture2D(map, vec2(clamp(az / PI + 0.5, 0.0, 1.0), v)).rgb;
      vec3 back = texture2D(map, vec2(clamp(azBack / PI + 0.5, 0.0, 1.0), v)).rgb;
      // The halves meet at the sides (|az| = PI/2); blend across a narrow band so there's no hard seam.
      float w = smoothstep(PI / 2.0 - 0.18, PI / 2.0 + 0.18, abs(az));
      col = mix(front, back, w);
    } else {
      col = core * (0.35 + 0.65 * facing);
    }
    col *= mix(0.35, 1.0, smoothstep(0.0, 0.7, facing));
    col += rim * pow(1.0 - facing, 2.6) * rimStrength;
    col *= 1.0 - dim;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

/**
 * Experiment: cubes instead of spheres. Each face of the cube shows the whole cover (the box's own UVs, so the
 * back reads correctly from behind), shaded by how squarely it faces the camera, with its edges lit in the glow
 * colour so the bloom catches them the way it catches a sphere's rim. They always face the camera (no spin). Without a cover, a softly glowing core.
 */
const cubeVertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`
const cubeFragmentShader = /* glsl */`
  uniform sampler2D map;
  uniform float hasMap;
  uniform vec3 core;
  uniform vec3 rim;
  uniform float rimStrength;
  uniform float dim;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(-vViewPosition);
    float facing = max(dot(n, v), 0.0);
    vec3 col = hasMap > 0.5 ? texture2D(map, vUv).rgb : core * (0.35 + 0.65 * facing);
    col *= mix(0.35, 1.0, smoothstep(0.0, 0.8, facing));
    // 0 at the centre of the face, 1 on its edges.
    vec2 d = abs(vUv - 0.5) * 2.0;
    float edge = max(d.x, d.y);
    col += rim * (smoothstep(0.86, 1.0, edge) * 0.8 + pow(1.0 - facing, 3.0) * 0.35) * rimStrength;
    col *= 1.0 - dim;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const up = new Vector3(0, 1, 0), at = new Vector3(), facing = new Quaternion(), parent = new Quaternion()

/** Which shape the covers go on: spheres; add ?shape=cube to the URL to see the cube experiment. */
const SHAPE: 'cube' | 'sphere' =
  typeof location !== 'undefined' && new URLSearchParams(location.search).get('shape') === 'cube' ? 'cube' : 'sphere'
/** A cube's edge (and a sphere's diameter), as a multiple of the radius it's given: half the size that first matched the original spheres (1.55). */
const CUBE_EDGE = 0.775
/** How far the shape reaches from its centre, as a multiple of the radius it's given: for placing labels, icons and
 * stem ends against what's actually drawn. Layout spacing still goes by the radius. */
export const SHAPE_EXTENT = CUBE_EDGE / 2
/** Spheres are drawn as wide as the cubes: half the radius they're given (which still sets the layout spacing). */
const SPHERE_SCALE = CUBE_EDGE / 2

type Props = {
  image?: string
  radius: number
  rimStrength?: number
  /** Glow (rim) colour, e.g. the cover's dominant colour; the theme's signal colour when not given. */
  glow?: string
  /** How faded it is right now (0: not at all, 1: black), read every frame: for active rating. */
  dim?: { current: number }
}

export const CoverSphere = ({ image, radius, rimStrength = 2.2, glow, dim }: Props) => {
  const texture = useCoverTexture(image)
  const material = useMemo(() => new ShaderMaterial({
    vertexShader: SHAPE === 'cube' ? cubeVertexShader : vertexShader,
    fragmentShader: SHAPE === 'cube' ? cubeFragmentShader : fragmentShader,
    uniforms: {
      map: { value: null },
      hasMap: { value: 0 },
      core: { value: new Color(theme.signalDim).multiplyScalar(0.55) }, // kept under the bloom threshold so it reads as a sphere, not a blob
      rim: { value: new Color(theme.signal) },
      rimStrength: { value: rimStrength },
      dim: { value: 0 },
    },
  }), [])

  useEffect(() => {
    material.uniforms.map.value = texture
    material.uniforms.hasMap.value = texture ? 1 : 0
  }, [material, texture])
  useEffect(() => { material.uniforms.rimStrength.value = rimStrength }, [material, rimStrength])
  useEffect(() => { (material.uniforms.rim.value as Color).set(glow ?? theme.signal) }, [material, glow])
  useEffect(() => () => material.dispose(), [material])

  // Cubes don't spin or tilt with whatever holds them: each one turns its front face to the camera, around the
  // vertical axis only (so the top face shows from above, and up stays up).
  const mesh = useRef<Mesh>(null)
  useFrame(({ camera }) => {
    material.uniforms.dim.value = dim?.current ?? 0
    const m = mesh.current
    if (SHAPE !== 'cube' || !m?.parent) return
    m.getWorldPosition(at)
    facing.setFromAxisAngle(up, Math.atan2(camera.position.x - at.x, camera.position.z - at.z))
    m.parent.getWorldQuaternion(parent)
    m.quaternion.copy(parent.invert().multiply(facing))
  })

  return <mesh ref={mesh} material={material}>
    {SHAPE === 'cube'
      ? <boxGeometry args={[radius * CUBE_EDGE, radius * CUBE_EDGE, radius * CUBE_EDGE]} />
      : <sphereGeometry args={[radius * SPHERE_SCALE, 48, 32]} />}
  </mesh>
}
