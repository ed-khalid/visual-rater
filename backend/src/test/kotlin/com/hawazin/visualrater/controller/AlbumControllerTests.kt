package com.hawazin.visualrater.controller

import com.hawazin.visualrater.controllers.AlbumController
import com.hawazin.visualrater.models.graphql.ExternalSearchAlbum
import com.hawazin.visualrater.models.graphql.ExternalSearchArtist
import com.hawazin.visualrater.models.graphql.ExternalSearchTracks
import com.hawazin.visualrater.services.AlbumPublisher
import com.hawazin.visualrater.services.ImageService
import com.hawazin.visualrater.services.SpotifyApi
import io.kotest.core.extensions.Extension
import io.kotest.core.spec.style.StringSpec
import io.kotest.property.Arb
import io.kotest.property.arbitrary.*
import io.mockk.mockk
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class AlbumControllerTestsSpec: StringSpec({

    fun extensions(): List<Extension> = listOf()


    val spotifyService = mockk<SpotifyApi>()
    val imageService = mockk<ImageService>()
    val publisherService = mockk<AlbumPublisher>()

    /*
    val controller = AlbumController(spotifyService, imageService, publisherService)
     */


    "it should create an album for an external artist" {
        val externalArtist = Arb.externalSearchArtist().next()
    }


})

fun Arb.Companion.externalSearchArtist(): Arb<ExternalSearchArtist> = arbitrary {
    ExternalSearchArtist(
        id = Arb.uuid().next().toString(),
        name = Arb.string(10).next(),
        thumbnail = null,
        albums = Arb.list(Arb.externalSearchAlbum(), 2..3).next()
    )
}

fun Arb.Companion.externalSearchTrack(): Arb<ExternalSearchTracks> = arbitrary {
    ExternalSearchTracks(
        id = Arb.string(15).next(),
        name = Arb.string(20).next(),
        discNumber =  1,
        trackNumber = Arb.int(1..10).next()
    )
}

fun Arb.Companion.externalSearchAlbum(): Arb<ExternalSearchAlbum> = arbitrary {
    ExternalSearchAlbum(
        id = Arb.uuid().next().toString(),
        name = Arb.string(20).next(),
        thumbnail = Arb.string(30).next(),
        year = Arb.int(1950..2010).next()
    )
}