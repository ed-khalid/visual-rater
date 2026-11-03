import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'

/** Post-processing: glow on bright things, fine film grain, darkened edges. Kept subtle. */
export const Effects = () =>
  <EffectComposer multisampling={4}>
    <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} radius={0.7} />
    <Noise opacity={0.035} />
    <Vignette offset={0.25} darkness={0.75} />
  </EffectComposer>
