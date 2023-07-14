package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.graphql.NewAlbumInput
import com.hawazin.visualrater.services.ImageService
import com.hawazin.visualrater.services.MusicService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class AlbumController(val musicService: MusicService, val imageService:ImageService) {

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