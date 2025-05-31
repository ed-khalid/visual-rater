package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.api.ArtistPage
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.graphql.ArtistInput
import com.hawazin.visualrater.models.graphql.ArtistSearchParams
import com.hawazin.visualrater.models.graphql.UpdateArtistInput
import com.hawazin.visualrater.services.*
import org.reactivestreams.Publisher
import org.springframework.graphql.data.method.annotation.*
import org.springframework.stereotype.Controller
import java.time.OffsetDateTime

@Controller
class ArtistController(val musicService: MusicCrudService, val publisherService: ArtistPublisher, val imageService: ImageService) {


    @QueryMapping
    fun artists() : ArtistPage {
        val artists = musicService.readArtists()
        return ArtistPage(total= artists.totalPages, pageNumber = artists.pageable.pageNumber, content = artists.content)
    }

    @QueryMapping
    fun artist(@Argument params: ArtistSearchParams) : Artist? {
        val maybeArtist = musicService.getArtist(params)
        return if (maybeArtist.isPresent) {
            val artist = maybeArtist.get()
            return Artist(id= artist.id, vendorId = artist.vendorId, albums = artist.albums, score= artist.score, metadata = artist.metadata, thumbnail =  artist.thumbnail, name=artist.name, thumbnailDominantColors = artist.thumbnailDominantColors, createdAt = artist.createdAt , updatedAt = artist.updatedAt, primaryGenre = artist.primaryGenre, secondaryGenres = artist.secondaryGenres)
        } else {
            null
        }
    }

    @SubscriptionMapping
    fun artistUpdated() : Publisher<Artist>  {
        return publisherService
    }

    @MutationMapping
    fun updateArtist(@Argument artist: UpdateArtistInput) : Artist {
        return musicService.updateArtist(artist)
    }

    @MutationMapping
    fun CreateArtist(@Argument artist: ArtistInput): Artist {
        val dominantColors = artist.thumbnail?.let {
            imageService.getTop3DominantColors(artist.thumbnail)?.colors
        }
        return musicService.createArtist(artist, dominantColors)
    }
}