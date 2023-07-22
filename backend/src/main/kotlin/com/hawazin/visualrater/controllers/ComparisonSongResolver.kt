package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.ComparisonSongProjection
import com.hawazin.visualrater.services.MusicService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class ComparisonSongResolver(val musicService: MusicService) {


    @QueryMapping
    fun compareToOtherSongsBySameArtist(@Argument songId:String, @Argument artistId:String, @Argument albumId:String): Iterable<ComparisonSongProjection> {
        return musicService.compareOtherSongsSameArtist(songId, artistId, albumId)
    }
    @QueryMapping
    fun compareToOtherSongsByOtherArtists(@Argument songId:String, @Argument artistId:String): Iterable<ComparisonSongProjection> {
        return musicService.compareOtherSongsOtherArtists(songId, artistId)
    }


}