package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.api.ArtistPage
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.graphql.ArtistQueryParams
import com.hawazin.visualrater.models.graphql.UpdateArtistInput
import com.hawazin.visualrater.services.*
import org.reactivestreams.Publisher
import org.springframework.graphql.data.method.annotation.*
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class ArtistController(val musicService: MusicCrudService, val publisherService: ArtistPublisher) {


    @QueryMapping
    fun artists(@Argument params: ArtistQueryParams) : ArtistPage {
        val artists = musicService.readArtists(params)
        return ArtistPage(totalPages= artists.totalPages, pageNumber = artists.pageable.pageNumber, content = artists.content)
    }
    @QueryMapping
    fun artist(@Argument id: String): Artist? {
        val artist = musicService.readArtistById(UUID.fromString(id))
        return if (artist.isPresent) {
            artist.get()
        } else {
            null
        }
    }

    @MutationMapping
    fun updateArtist(@Argument artist: UpdateArtistInput) : Artist {
        return musicService.updateArtist(artist)
    }

    @MutationMapping
    fun deleteArtist(@Argument id: String) : Boolean {
        return musicService.deleteArtistById(UUID.fromString(id))
    }

    @SubscriptionMapping
    fun artistUpdated() : Publisher<Artist>  {
        return publisherService
    }

}