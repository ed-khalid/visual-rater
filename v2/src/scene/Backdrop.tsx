import { Grid } from '@react-three/drei'
import { theme } from '../theme'
import { AXIS_BOTTOM } from './world'

/** A faint infinite floor grid just below the axis, fading into fog. */
export const Backdrop = () => <>
  <fog attach="fog" args={[theme.void, 14, 40]} />
  <Grid
    position={[0, AXIS_BOTTOM - 0.6, 0]}
    infiniteGrid
    cellSize={0.5}
    cellThickness={0.6}
    cellColor={theme.grid}
    sectionSize={2.5}
    sectionThickness={1}
    sectionColor={theme.gridSection}
    fadeDistance={34}
    fadeStrength={1.6}
    followCamera={false}
  />
</>
