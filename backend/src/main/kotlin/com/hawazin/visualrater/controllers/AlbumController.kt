package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.NewAlbumInput
import com.hawazin.visualrater.services.ImageService
import com.hawazin.visualrater.services.MusicService
import jakarta.persistence.*
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class AlbumController(val musicService: MusicService, val imageService:ImageService) {

    @QueryMapping
    fun albums(@Argument artistId:String) : Iterable<AlbumWithArtistName>  {
        val albums =  musicService.readAlbumsForArtist(UUID.fromString(artistId))
        val artist = musicService.readArtistById(UUID.fromString(artistId))
        return albums.map {
            AlbumWithArtistName(it.id, it.name, it.thumbnail, it.year, it.dominantColor, it.score, it.artistId, listOf() , if (artist.isPresent) artist.get().name else "" )
        }
    }

    @MutationMapping
    fun CreateAlbum(@Argument album:NewAlbumInput) : Album {
        if (album.thumbnail != null) {
            val dominantColorResponse = imageService.getDominantColor(album.thumbnail)
            album.dominantColor = dominantColorResponse.colorString
        }
        return musicService.createAlbum(album)
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
