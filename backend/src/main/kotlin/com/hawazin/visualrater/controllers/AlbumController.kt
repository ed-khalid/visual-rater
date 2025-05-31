package com.hawazin.visualrater.controllers

import arrow.fx.coroutines.parMap
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
    fun albums(@Argument ids:List<String>) : Iterable<AlbumWithArtistName>  {
        val uuids = ids.map { UUID.fromString(it)}
        val albums =  musicService.readAlbums(uuids)
        val artists =  musicService.readArtists(albums.map{ it. artistId })
        return albums.map { it ->
            val artist = artists.find { artist ->  artist.id == it.artistId }
            AlbumWithArtistName(it.id, it.name, it.thumbnail, it.year, it.dominantColor, it.score, it.artistId, it.songs , artist?.name ?: "" )
        }
    }
    @QueryMapping
    fun unratedAlbums(): Iterable<Album> = musicService.getUnratedAlbums()



    @SubscriptionMapping
    fun albumUpdated() : Publisher<Album> {
        return publisherService
    }

    @MutationMapping
    fun createAlbumsForExternalArtist(@Argument externalArtist:ExternalSearchArtist) : Artist = runBlocking {
        val dominantColorArtistDeferred = async(Dispatchers.IO) {
            externalArtist.thumbnail?.let { thumbnail ->
                imageService.getDominantColor(thumbnail)
            }
        }
        val dominantColorArtist = dominantColorArtistDeferred.await()?.colorString

        val newArtist = musicService.createArtist(
            ArtistInput(
                name = externalArtist.name,
                thumbnail = externalArtist.thumbnail,
                vendorId =  externalArtist.id,
                dominantColor = dominantColorArtist
            )
        )

        val albumTracks = externalArtist.albums.parMap(Dispatchers.IO) {
            val tracks = spotifyService.getTracksForAlbum(albumId = it.id)
            val dominantColorAlbumDeferred = async {
                it.thumbnail?.let { thumbnail ->
                    imageService.getDominantColor(thumbnail)
                }
            }
            val dominantColorAlbum = dominantColorAlbumDeferred.await()?.colorString
            NewExternalAlbumInput(
                name = it.name,
                thumbnail = it.thumbnail,
                dominantColor = dominantColorAlbum,
                year = it.year,
                songs = tracks.map {
                    NewSongInput(
                        name = it.name,
                        number = it.trackNumber,
                        discNumber = it.discNumber,
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

}

data class AlbumWithArtistName(
    val id:UUID,
    val name:String,
    val thumbnail:String?,
    val year:Int,
    val dominantColor:String?,
    val score:Double?,
    val artistId:UUID,
    val songs:List<Song>?,
    val artistName:String
)
