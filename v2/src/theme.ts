/** One palette for the whole app. Colours above ~1.0 in the scene are pushed past the bloom threshold on purpose. */
export const theme = {
  void: '#03050a',        // background
  grid: '#0f1c2e',        // faint grid lines
  gridSection: '#16304d', // every 5th line
  signal: '#5ce1ff',      // primary accent: the axis, focus, active things
  signalDim: '#2f8fb0',
  text: '#9fb3c8',
  textDim: '#4a5d72',
  font: `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`,
} as const
