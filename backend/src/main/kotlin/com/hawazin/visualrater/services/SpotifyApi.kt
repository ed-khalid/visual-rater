package com.hawazin.visualrater.services

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.hawazin.visualrater.models.graphql.ExternalSearchArtist
import com.hawazin.visualrater.models.graphql.ExternalSearchTracks
import com.hawazin.visualrater.configurations.SpotifyConfiguration
import com.hawazin.visualrater.graphql.CustomRestTemplateCustomizer
import com.hawazin.visualrater.models.graphql.ExternalSearchAlbum
import com.hawazin.visualrater.scripts.SpotifyAlbumThumbnail
import com.hawazin.visualrater.scripts.SpotifyThumbnails
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.getForObject

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpotifyAuthToken(@JsonProperty("access_token") val accessToken:String?, @JsonProperty("expires_in") val expiresIn:Int?)


@Service
class SpotifyApi(private val configuration: SpotifyConfiguration) {

    private var token: SpotifyAuthToken? = null
    private val accountsTemplate: RestTemplate = RestTemplateBuilder()
            .rootUri(configuration.accounts)
            .basicAuthentication(configuration.client.id, configuration.client.secret)
            .build()

    private fun api() : RestTemplate {
        if (token == null) {
            token = requestToken()
        }
        return RestTemplateBuilder(CustomRestTemplateCustomizer())
                .rootUri(configuration.api)
                .defaultHeader("Authorization", "Bearer ${token?.accessToken}")
                .build()
    }

    private fun <R> makeCall(call: () -> R ): R {
        return try {
            call();
        }
        catch(hex:HttpClientErrorException.Unauthorized)
        {
            token = requestToken();
            call();
        }
    }

    private fun requestToken() : SpotifyAuthToken?  {
        val postParams = LinkedMultiValueMap<String,String>()
        postParams.add("grant_type", "client_credentials")
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED
        val request = HttpEntity(postParams,headers)
        return accountsTemplate.postForObject<SpotifyAuthToken>("/api/token", request, SpotifyAuthToken::class.java)
    }

    fun getSpotifyThumbnailsByArtistName(artistName: String): SpotifyThumbnails {
        val artistResponse = makeCall { api().getForObject<SpotifyArtistListResponse>("/search?q={name}&type=artist", artistName) }
        val artist = artistResponse.artists.items[0]
        val albumResponse = makeCall {
            api().getForObject<SpotifyAlbumList>(
                "/artists/{artistId}/albums?limit=50&county=US&include_groups=album",
                artist.id
            )
        }
        val albumThumbnails = albumResponse.items.map { album -> SpotifyAlbumThumbnail(albumId = album.id, albumName= album.name, thumbnailUrl =  album.images[0].url  ) }
        return SpotifyThumbnails(artistName, artistId = artist.id, thumbnailUrl = artist.images[0].url, albumThumbnails)
    }

    fun searchArtist(name:String) : ExternalSearchArtist {
        val response = makeCall { api().getForObject<SpotifyArtistListResponse>("/search?q={name}&type=artist", name) }
        val artist = response.artists.items[0]
        val albums = getAlbumsForArtist(artist.id)
        return ExternalSearchArtist(id = artist.id, name= artist.name, thumbnail = artist.images[0].url, albums = albums)
    }

    // let's forget about the offset for now
    private fun getAlbumsForArtist(artistId: String): List<ExternalSearchAlbum> {
        val response = makeCall {
            api().getForObject<SpotifyAlbumList>(
                "/artists/{artistId}/albums?limit=50&county=US&include_groups=album",
                artistId
            )
        }
        fun dateParser (date:String) : Int {
            val dateArr =  date.split("-")
            return dateArr[0].toInt()
        }
        return response.items.distinctBy { album -> album.name }
            .map { ExternalSearchAlbum(id = it.id, name = it.name, thumbnail = it.images[0].url, year = dateParser(it.release_date)) }
            .sortedBy { it.year  }
    }

    fun getTracksForAlbum(albumId:String) : List<ExternalSearchTracks> {
        val response = makeCall { api().getForObject<SpotifyTrackList>("/albums/{albumId}/tracks?limit=50", albumId) }
        return response.items
    }
}

// Spotify Models
data class SpotifyArtistListResponse(val artists: SpotifyArtistList)
data class SpotifyArtist(val id:String, val name:String, val images:Array<SpotifyImage>)
data class SpotifyArtistList(val items:List<SpotifyArtist>)
data class SpotifyAlbum(val id:String, val name:String, val images:Array<SpotifyImage>, val release_date:String)
data class SpotifyAlbumList(val items:List<SpotifyAlbum>)
data class SpotifyImage(val url:String, val width:Int, val height:Int) {
    override fun toString() = "url: $url, width: $width, height $height "
}
data class SpotifyTrackList(val items:List<ExternalSearchTracks>)
