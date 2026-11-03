import { useCallback, useState } from "react"
import { Song, useUpdateSongMutation } from "../generated/graphql"

/**
 * Saves a song's score and reports failures instead of dropping them.
 * `saveScore` resolves to true on success and false on failure (it never rejects),
 * so callers holding local UI state can roll back.
 */
export const useSaveSongScore = () => {
    const [updateSong] = useUpdateSongMutation()
    const [error, setError] = useState<string | null>(null)

    const saveScore = useCallback(async (song: Pick<Song, 'id' | 'name' | 'score'>): Promise<boolean> => {
        try {
            const result = await updateSong({ variables: { song: { id: song.id, score: song.score } } })
            if (result.errors?.length) throw new Error(result.errors.map(e => e.message).join('; '))
            return true
        } catch (e) {
            const reason = e instanceof Error ? e.message : String(e)
            setError(`Couldn't save the score for "${song.name ?? song.id}": ${reason}`)
            return false
        }
    }, [updateSong])

    const dismissError = useCallback(() => setError(null), [])

    return { saveScore, error, dismissError }
}
