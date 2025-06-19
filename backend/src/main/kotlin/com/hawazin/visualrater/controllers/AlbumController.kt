package com.hawazin.visualrater.controllers

import arrow.fx.coroutines.parMap
import com.hawazin.visualrater.models.api.AlbumPage
import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.*
import com.hawazin.visualrater.services.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.reactivestreams.Publisher
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SubscriptionMapping
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class AlbumController(val musicService: MusicCrudService, val spotifyService: SpotifyApi, val imageService:ImageService, val publisherService: AlbumPublisher) {

    @QueryMapping
    fun albums(@Argument params: AlbumQueryParams): AlbumPage {
        val albums = musicService.readAlbums(params)
        return AlbumPage(totalPages = albums.totalPages, pageNumber = albums.pageable.pageNumber, content = albums.content)
    }
    @QueryMapping
    fun album(@Argument id: String): Album? {
        val album = musicService.readAlbumById(UUID.fromString(id))
        return if (album.isPresent) {
            album.get()
        } else {
            null
        }
    }


    @MutationMapping
    fun createAlbumsForExternalArtist(@Argument externalArtist:ExternalSearchArtist) : Artist = runBlocking {
        val dominantColorArtistDeferred = async(Dispatchers.IO) {
            externalArtist.thumbnail?.let { thumbnail ->
                imageService.getTop3DominantColors(thumbnail)
            }
        }
        val dominantColorsArtist = dominantColorArtistDeferred.await()?.colors

        val newArtist = musicService.createArtist(
            ArtistInput(
                name = externalArtist.name,
                thumbnail = externalArtist.thumbnail,
                vendorId =  externalArtist.id,
            ),
            dominantColorsArtist
        )

        val albumTracks = externalArtist.albums.parMap(Dispatchers.IO) {
            val tracks = spotifyService.getTracksForAlbum(albumId = it.id)
            val dominantColorAlbumDeferred = async {
                it.thumbnail?.let { thumbnail ->
                    imageService.getTop3DominantColors(thumbnail)
                }
            }
            val dominantColorsAlbum = dominantColorAlbumDeferred.await()?.colors
            NewExternalAlbumInput(
                name = it.name,
                thumbnail = it.thumbnail,
                dominantColors = dominantColorsAlbum,
                year = it.year,
                songs = tracks.map { spotifyTrack ->
                    NewSongInput(
                        id = spotifyTrack.id,
                        name = spotifyTrack.name,
                        number = spotifyTrack.trackNumber,
                        score = null
                    )
                },
                artistId = newArtist.id!!,
                vendorId = it.id
            )
        }

        val newAlbums = albumTracks.parMap(Dispatchers.IO) { musicService.createAlbum(it) }
        val retv = newArtist.copy(albums = newAlbums.toMutableList())
        retv

    }

    @MutationMapping
    fun updateAlbum(@Argument album: UpdateAlbumInput) : Album {
        val newAlbum = musicService.updateAlbum(album)
        return newAlbum
    }

    @MutationMapping
    fun deleteAlbum(@Argument albumId:String) : Boolean {
        return musicService.deleteAlbumById(UUID.fromString(albumId))
    }

    @SubscriptionMapping
    fun albumUpdated() : Publisher<Album> {
        return publisherService
    }

}
