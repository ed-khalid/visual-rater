import { Grid } from '@react-three/drei'
import { theme } from '../theme'

/** Faint infinite grid facing the camera. */
export const Backdrop = () =>
  <Grid
    rotation={[Math.PI / 2, 0, 0]}
    position={[0, 0, -10]}
    infiniteGrid
    cellSize={0.5}
    cellThickness={0.6}
    cellColor={theme.grid}
    sectionSize={2.5}
    sectionThickness={1}
    sectionColor={theme.gridSection}
    fadeDistance={60}
    fadeStrength={1.5}
  />
