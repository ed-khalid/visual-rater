package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.api.ArtistPage
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.ArtistMetadata
import com.hawazin.visualrater.models.graphql.ArtistInput
import com.hawazin.visualrater.services.*
import org.reactivestreams.Publisher
import org.springframework.graphql.data.method.annotation.*
import org.springframework.stereotype.Controller

@Controller
class ArtistController(val musicService: MusicService, val publisherService: ArtistPublisher, val imageService: ImageService) {

    @QueryMapping
    fun artists() : ArtistPage {
        val artists = musicService.readArtists()
        return ArtistPage(total= artists.totalPages, pageNumber = artists.pageable.pageNumber, content = artists.content)
    }

    @QueryMapping
    fun artist(@Argument name:String) : Artist? {
        val maybeArtist = musicService.readArtistByName(name)
        return if (maybeArtist.isPresent) {
            val artist = maybeArtist.get()
            return Artist(id= artist.id, vendorId = artist.vendorId, albums = artist.albums, score= artist.score, metadata = artist.metadata, thumbnail =  artist.thumbnail, name=artist.name, dominantColor = artist.dominantColor)
        } else {
            null
        }
    }

    @SubscriptionMapping
    fun artistUpdated() : Publisher<Artist>  {
        return publisherService
    }

    @MutationMapping
    fun CreateArtist(@Argument artist: ArtistInput): Artist {
        if (artist.thumbnail != null) {
            artist.dominantColor = imageService.getDominantColor(artist.thumbnail).colorString
        }
        return musicService.createArtist(artist)
    }
}