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
        return musicService.readAlbumsForArtist(artistId)
    }

    @SchemaMapping
    fun songs(album:Album) : Iterable<Song>  {
        return emptyList()
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
    fun createAlbum(@Argument albumInput:NewAlbumInput) : Album {
        if (albumInput.thumbnail != null) {
            val dominantColorResponse = imageService.getDominantColor(albumInput.thumbnail)
            albumInput.dominantColor = dominantColorResponse.colorString
        }
        return musicService.createAlbum(albumInput)
    }
    @MutationMapping
    fun deleteAlbum(@Argument albumId:String) : Boolean {
        return musicService.deleteAlbumById(UUID.fromString(albumId))
    }

}