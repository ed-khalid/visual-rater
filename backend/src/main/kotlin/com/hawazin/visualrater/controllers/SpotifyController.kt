package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.graphql.Artist
import com.hawazin.visualrater.models.graphql.Track
import com.hawazin.visualrater.services.SpotifyApi
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class SpotifyController(val spotifyApi: SpotifyApi) {

    @QueryMapping
    fun searchExternalArtist(@Argument name:String) : Artist {
        return spotifyApi.searchArtist(name.lowercase())
    }
    @QueryMapping
    fun searchExternalAlbumTracks(@Argument albumId:String) : List<Track> {
        return spotifyApi.getTracksForAlbum(albumId)
    }
}