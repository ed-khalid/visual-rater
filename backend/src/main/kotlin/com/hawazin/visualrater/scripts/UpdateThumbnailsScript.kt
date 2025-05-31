package com.hawazin.visualrater.scripts

import com.hawazin.visualrater.services.*
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

data class SpotifyThumbnails(
    val artistName: String,
    val artistId: String,
    val thumbnailUrl: String,
    val albums: List<SpotifyAlbumThumbnail>
)
data class SpotifyAlbumThumbnail(
    val albumName: String,
    val albumId: String,
    val thumbnailUrl: String
)

/** update thumbnails to highest quality available **/
@Component
@Profile("script")
class UpdateThumbnailsScript(
    private val spotifyApi: SpotifyApi,
    private val albumRepository: AlbumRepository,
    private val artistRepository: ArtistRepository,
) {

    fun updateThumbnails(vararg args: String?) {
        println("Starting update thumbnails script...")
        val artists = artistRepository.findAll()
        println("Searching spotify for artist ${artists[0].name}")
        artists.forEach { artist ->
            val response = spotifyApi.getSpotifyThumbnailsByArtistName(artist.name)
            artist.thumbnail = response.thumbnailUrl
            response.albums.forEach { spotifyAlbum ->
                val savedAlbum = albumRepository.findByVendorId(spotifyAlbum.albumId)
                if (savedAlbum.isPresent) {
                    val album = savedAlbum.get()
                    album.thumbnail = spotifyAlbum.thumbnailUrl
                    albumRepository.save(album)
                    println("Successfully updated album ${album.name}")

                } else {
                    println("Found nothing in db for album ${spotifyAlbum.albumName}, id:${spotifyAlbum.albumId}")
                }
            }
            artistRepository.save(artist)
            println("Successfully updated artist ${artist.name}")
        }
    }

}