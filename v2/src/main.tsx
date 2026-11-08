import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Connection } from './hud/Connection'
import { Hud } from './hud/Hud'
import { Board } from './scene/Board'
import { startSync } from './state/remote'
import './index.css'

void startSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Connection>
      <Board />
      <Hud />
    </Connection>
  </StrictMode>,
)
