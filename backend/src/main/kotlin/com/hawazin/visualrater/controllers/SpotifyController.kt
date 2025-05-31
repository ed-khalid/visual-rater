package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.graphql.ExternalSearchArtist
import com.hawazin.visualrater.models.graphql.ExternalSearchTracks
import com.hawazin.visualrater.models.graphql.ExternalSearchTracksResponse
import com.hawazin.visualrater.services.SpotifyApi
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class SpotifyController(val spotifyApi: SpotifyApi) {

    @QueryMapping
    fun searchExternalArtist(@Argument name:String) : ExternalSearchArtist {
        return spotifyApi.searchArtist(name.lowercase())
    }
}