package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.NewAlbumInput
import com.hawazin.visualrater.services.ImageService
import com.hawazin.visualrater.services.MusicService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class AlbumController(val musicService: MusicService, val imageService:ImageService) {

    @QueryMapping
    fun albums(@Argument artistId:String) : Iterable<Album>  {
        val albums =  musicService.readAlbumsForArtist(artistId)
        albums.forEach { it.songs = mutableListOf()  }
        return albums
    }

    @SchemaMapping
    fun artistId(album:Album) : String {
        return album.artist.id.toString()
    }
    @SchemaMapping
    fun artistName(album: Album): String {
        return album.artist?.name.toString()
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