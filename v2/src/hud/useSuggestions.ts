import { useEffect, useState } from 'react'
import type { Suggestion, SuggestionsResponse } from '../shared/suggestions'

export type SuggestionsState =
  | { status: 'idle' | 'loading' | 'unsupported', results: Suggestion[] }
  | { status: 'ready', results: Suggestion[] }
  | { status: 'error', results: Suggestion[] }

const DEBOUNCE_MS = 200
const MIN_QUERY = 2

/** Recent answers, so backspacing over a query shows results instantly. */
const cache = new Map<string, SuggestionsResponse>()

/**
 * Catalogue matches for what's being typed, from the API server. Waits for a pause in typing,
 * cancels requests that are no longer current, and keeps showing the last results while the next load.
 */
export const useSuggestions = (typeId: string | undefined, query: string): SuggestionsState => {
  const [state, setState] = useState<SuggestionsState>({ status: 'idle', results: [] })
  const q = query.trim()

  useEffect(() => {
    if (!typeId || q.length < MIN_QUERY) { setState({ status: 'idle', results: [] }); return }
    const key = `${typeId}:${q.toLowerCase()}`
    const hit = cache.get(key)
    if (hit) { setState(hit.supported ? { status: 'ready', results: hit.results } : { status: 'unsupported', results: [] }); return }

    setState(prev => ({ status: 'loading', results: prev.results }))
    const abort = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions/${encodeURIComponent(typeId)}?q=${encodeURIComponent(q)}`, { signal: abort.signal })
        if (!res.ok) throw new Error(String(res.status))
        const body = await res.json() as SuggestionsResponse
        cache.set(key, body)
        if (cache.size > 200) cache.delete(cache.keys().next().value!)
        setState(body.supported ? { status: 'ready', results: body.results } : { status: 'unsupported', results: [] })
      } catch (e) {
        if (!abort.signal.aborted) setState({ status: 'error', results: [] })
      }
    }, DEBOUNCE_MS)
    return () => { clearTimeout(timer); abort.abort() }
  }, [typeId, q])

  return state
}
