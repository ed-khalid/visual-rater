package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.ComparisonSongProjection
import com.hawazin.visualrater.services.MusicCrudService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class ComparisonSongResolver(val musicCrudService: MusicCrudService) {

    @QueryMapping
    fun compareToOtherSongsBySameArtist(@Argument songId:String, @Argument artistId:String, @Argument albumId:String): Iterable<ComparisonSongProjection> {
        return musicCrudService.compareOtherSongsSameArtist(songId, artistId, albumId)
    }
    @QueryMapping
    fun compareToOtherSongsByOtherArtists(@Argument songId:String, @Argument artistId:String): Iterable<ComparisonSongProjection> {
        return musicCrudService.compareOtherSongsOtherArtists(songId, artistId)
    }


}