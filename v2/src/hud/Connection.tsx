import { startSync, useSync } from '../state/remote'
import './connection.css'

/**
 * Shown instead of the UI until the saved state has loaded (so nothing is created twice), and in place of it if
 * the server can't be reached. Once loaded, only a quiet corner note appears, and only if a save is failing.
 */
export const Connection = ({ children }: { children: React.ReactNode }) => {
  const status = useSync(s => s.status)
  const error = useSync(s => s.error)

  if (status === 'loading') return <div className="connection" aria-live="polite">Loading…</div>
  if (status === 'offline') return <div className="connection" role="alert">
    <span>Can&apos;t reach the server.</span>
    <button className="connection-retry" onClick={() => void startSync()}>RETRY</button>
  </div>
  return <>
    {children}
    {error && <div className="save-error" role="status" title={error}>NOT SAVED · RETRYING</div>}
  </>
}
