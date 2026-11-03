package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.Genre
import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.SongInput
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.*

class MusicCrudServiceUpdateSongSpec : StringSpec({

    val unrated = Genre(id = 1, name = "NOT CHOSEN")

    fun song(score: Double?) = Song(
        id = UUID.randomUUID(), name = "Song", number = 1, score = score,
        createdAt = null, updatedAt = null, primaryGenre = unrated,
        vendorId = null, secondaryGenres = mutableListOf(),
    )

    fun serviceWith(existing: Song): Pair<MusicCrudService, SongRepository> {
        val genreRepo = mockk<GenreRepository> { every { findByName("NOT CHOSEN") } returns Optional.of(unrated) }
        val songRepo = mockk<SongRepository> {
            every { findById(existing.id) } returns Optional.of(existing)
            every { save(any()) } answers { firstArg() }
        }
        val service = MusicCrudService(
            genreRepo, songRepo, mockk<AlbumRepository>(), mockk<ArtistRepository>(),
            mockk<PublisherService<Artist>>(), mockk<PublisherService<Album>>(),
        )
        return service to songRepo
    }

    "sets the new score and saves it" {
        val existing = song(50.0)
        val (service, songRepo) = serviceWith(existing)

        val updated = service.updateSong(SongInput(id = existing.id, score = 72.5, name = null, number = null))

        updated.score shouldBe 72.5
        updated.updatedAt.shouldNotBeNull()
        verify(exactly = 1) { songRepo.save(existing) }
    }

    "a null score leaves the existing score alone" {
        val existing = song(50.0)
        val (service, _) = serviceWith(existing)

        service.updateSong(SongInput(id = existing.id, score = null, name = null, number = null)).score shouldBe 50.0
    }

    "a negative score clears the rating" {
        val existing = song(50.0)
        val (service, _) = serviceWith(existing)

        service.updateSong(SongInput(id = existing.id, score = -1.0, name = null, number = null)).score.shouldBeNull()
    }

    "name and number update only when given" {
        val existing = song(50.0)
        val (service, _) = serviceWith(existing)

        val renamed = service.updateSong(SongInput(id = existing.id, score = null, name = "New", number = null))
        renamed.name shouldBe "New"
        renamed.number shouldBe 1
    }

})
