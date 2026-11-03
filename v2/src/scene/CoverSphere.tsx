import { useEffect, useMemo, useState } from 'react'
import { Color, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader } from 'three'
import { theme } from '../theme'

const loader = new TextureLoader().setCrossOrigin('anonymous')
const textures = new Map<string, Promise<Texture>>()

/** Loads (once per URL) and returns a cover texture, or null until it's ready or if it fails. */
const useCoverTexture = (url?: string) => {
  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    if (!url) return setTexture(null)
    let cancelled = false
    if (!textures.has(url)) {
      textures.set(url, loader.loadAsync(url).then(t => { t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t }))
    }
    textures.get(url)!.then(t => { if (!cancelled) setTexture(t) }, () => { textures.delete(url) })
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
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

type Props = { image?: string, radius: number, rimStrength?: number }

export const CoverSphere = ({ image, radius, rimStrength = 2.2 }: Props) => {
  const texture = useCoverTexture(image)
  const material = useMemo(() => new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      map: { value: null },
      hasMap: { value: 0 },
      core: { value: new Color(theme.signalDim).multiplyScalar(0.55) }, // kept under the bloom threshold so it reads as a sphere, not a blob
      rim: { value: new Color(theme.signal) },
      rimStrength: { value: rimStrength },
    },
  }), [])

  useEffect(() => {
    material.uniforms.map.value = texture
    material.uniforms.hasMap.value = texture ? 1 : 0
  }, [material, texture])
  useEffect(() => { material.uniforms.rimStrength.value = rimStrength }, [material, rimStrength])
  useEffect(() => () => material.dispose(), [material])

  return <mesh material={material}>
    <sphereGeometry args={[radius, 48, 32]} />
  </mesh>
}
