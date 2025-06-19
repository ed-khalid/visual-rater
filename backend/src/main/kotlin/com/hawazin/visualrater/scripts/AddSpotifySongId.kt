package com.hawazin.visualrater.scripts

import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.services.*
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("script")
class AddSpotifySongId(
    private val spotifyApi: SpotifyApi,
    private val songRepository: SongRepository
) {


    fun arePrettySimilar(string1: String, string2: String, threshold: Double = 0.8): Boolean {
        val distance = levenshteinDistance(string1, string2)
        val maxLen = maxOf(string1.length, string2.length)
        if (maxLen == 0) return true
        val similarity = 1.0 - distance.toDouble() / maxLen
        return similarity >= threshold
    }
    fun levenshteinDistance(lhs: CharSequence, rhs: CharSequence): Int {
        val lhsLen = lhs.length + 1
        val rhsLen = rhs.length + 1

        val cost = Array(lhsLen) { IntArray(rhsLen) }

        for (i in 0 until lhsLen) cost[i][0] = i
        for (j in 0 until rhsLen) cost[0][j] = j

        for (i in 1 until lhsLen) {
            for (j in 1 until rhsLen) {
                val substitutionCost = if (lhs[i - 1] == rhs[j - 1]) 0 else 1
                cost[i][j] = minOf(
                    cost[i - 1][j] + 1,              // Deletion
                    cost[i][j - 1] + 1,              // Insertion
                    cost[i - 1][j - 1] + substitutionCost // Substitution
                )
            }
        }
        return cost[lhsLen - 1][rhsLen - 1]
    }

    fun run() {
        for (song in songRepository.findAll().filter { it.vendorId == null }) {
            println("updating song  ${song.name}:")
            song.album?.vendorId?.let {
                println("spotify album id for song is $it")
                val tracks = spotifyApi.getTracksForAlbum(it)
                val spotifyTrack = tracks.find { track -> track.name.contains(song.name!!)  }
                spotifyTrack?.let { spotifyTrack ->
                    println("found spotify track for ${song.name}")
                    song.vendorId = spotifyTrack.id
                    songRepository.save(song)
                    println("updated ${song.name} with spotify id")
                } ?: { println(" could not find a matching spotify track for ${song.name} ") }
            } ?: println("could not find a spotify album id for ${song.name} ")
        }
    }

}
