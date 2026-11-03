import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Connection } from './hud/Connection'
import { Hud } from './hud/Hud'
import { ItemLabels } from './scene/ItemLabels'
import { Stage } from './scene/Stage'
import { startSync } from './state/remote'
import { theme } from './theme'
import './index.css'

const root = document.documentElement.style
root.setProperty('--void', theme.void)
root.setProperty('--text', theme.text)
root.setProperty('--text-dim', theme.textDim)
root.setProperty('--font', theme.font)

void startSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Connection>
      <Stage />
      <ItemLabels />
      <Hud />
    </Connection>
  </StrictMode>,
)
