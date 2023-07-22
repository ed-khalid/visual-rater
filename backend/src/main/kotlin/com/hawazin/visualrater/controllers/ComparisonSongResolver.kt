package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.ComparisonSong
import com.hawazin.visualrater.services.MusicService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class ComparisonSongResolver(val musicService: MusicService) {


    @QueryMapping
    fun compareToOtherAlbumsBySameArtist(@Argument songId:String, @Argument artistId:String, @Argument albumId:String): Iterable<ComparisonSong> {
        return musicService.compareOtherAlbumsSameArtist(songId, artistId, albumId)
    }


}