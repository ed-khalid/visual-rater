package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.api.ArtistPage
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.ArtistMetadata
import com.hawazin.visualrater.models.graphql.ArtistInput
import com.hawazin.visualrater.services.MusicService
import com.hawazin.visualrater.services.PublisherService
import org.reactivestreams.Publisher
import org.springframework.graphql.data.method.annotation.*
import org.springframework.stereotype.Controller

@Controller
class ArtistController(val musicService: MusicService, val publisherService: PublisherService) {

    @QueryMapping
    fun artists() : ArtistPage {
        val artists = musicService.readArtists()
        artists.forEach { it.albums = mutableListOf()  }
        return ArtistPage(total= artists.totalPages, pageNumber = artists.pageable.pageNumber, content = artists.content)
    }

    @QueryMapping
    fun artist(@Argument name:String) : Artist? {
        val maybeArtist = musicService.readArtist(name)
        return if (maybeArtist.isPresent) {
            val artist = maybeArtist.get()
            artist
        } else {
            null
        }
    }

    @SubscriptionMapping
    fun artistMetadataUpdated() : Publisher<ArtistMetadata>  {
        return publisherService
    }

    @MutationMapping
    fun CreateArtist(@Argument artist: ArtistInput): Artist {
        return musicService.createArtist(artist)
    }
}