package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.NewAlbumInput
import com.hawazin.visualrater.models.graphql.UpdateAlbumInput
import com.hawazin.visualrater.services.AlbumPublisher
import com.hawazin.visualrater.services.ImageService
import com.hawazin.visualrater.services.MusicService
import com.hawazin.visualrater.services.PublisherService
import org.reactivestreams.Publisher
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SubscriptionMapping
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class AlbumController(val musicService: MusicService, val imageService:ImageService, val publisherService: AlbumPublisher) {

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

    @SubscriptionMapping
    fun albumUpdated() : Publisher<Album> {
        return publisherService
    }

    @MutationMapping
    fun CreateAlbum(@Argument album:NewAlbumInput) : Album {
        if (album.thumbnail != null) {
            val dominantColorResponse = imageService.getDominantColor(album.thumbnail)
            album.dominantColor = dominantColorResponse.colorString
        }
        if(album.artist.thumbnail != null) {
            val dominantColorResponse = imageService.getDominantColor(album.artist.thumbnail)
            album.artist.dominantColor = dominantColorResponse.colorString
        }
        return musicService.createAlbum(album)
    }

    @MutationMapping
    fun UpdateAlbum(@Argument album: UpdateAlbumInput) : Album {
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
    val score:Double,
    val artistId:UUID,
    val songs:List<Song>?,
    val artistName:String
)
