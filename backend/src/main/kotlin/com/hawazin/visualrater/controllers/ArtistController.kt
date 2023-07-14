package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.api.ArtistPage
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.ArtistMetadata
import com.hawazin.visualrater.models.graphql.ArtistInput
import com.hawazin.visualrater.services.MusicService
import com.hawazin.visualrater.services.PublisherService
import org.reactivestreams.Publisher
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SubscriptionMapping
import org.springframework.stereotype.Controller

@Controller
class ArtistController(val musicService: MusicService, val publisherService: PublisherService) {



    @QueryMapping
    fun artists() : ArtistPage {
        val artists = musicService.readArtists()
        return ArtistPage(total= artists.totalPages, pageNumber = artists.pageable.pageNumber, content = artists.content)
    }

    @QueryMapping
    fun artist(@Argument name:String) : Artist? {
        return musicService.readArtist(name)
    }

    @SubscriptionMapping
    fun artistMetadataUpdated() : Publisher<ArtistMetadata>  {
        return publisherService
    }

    @MutationMapping
    fun createArtist(@Argument newArtist: ArtistInput): Artist {
        return musicService.createArtist(newArtist)
    }
}