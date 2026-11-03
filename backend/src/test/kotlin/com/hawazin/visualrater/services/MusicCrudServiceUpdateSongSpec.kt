package com.hawazin.visualrater.services

import com.hawazin.visualrater.configurations.InvalidInputException
import com.hawazin.visualrater.configurations.NotFoundException
import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.Genre
import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.SongInput
import io.kotest.assertions.throwables.shouldThrow
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
            every { findById(any()) } returns Optional.empty()
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

    "an unknown song id is NOT_FOUND, not an internal error" {
        val (service, _) = serviceWith(song(50.0))
        shouldThrow<NotFoundException> {
            service.updateSong(SongInput(id = UUID.randomUUID(), score = 60.0, name = null, number = null))
        }
    }

    "scores above 100 or NaN are rejected and nothing is saved" {
        listOf(100.01, 250.0, Double.NaN).forEach { bad ->
            val existing = song(50.0)
            val (service, songRepo) = serviceWith(existing)
            shouldThrow<InvalidInputException> {
                service.updateSong(SongInput(id = existing.id, score = bad, name = null, number = null))
            }
            existing.score shouldBe 50.0
            verify(exactly = 0) { songRepo.save(any()) }
        }
    }

    "100 and 0 are allowed" {
        listOf(100.0, 0.0).forEach { edge ->
            val existing = song(50.0)
            val (service, _) = serviceWith(existing)
            service.updateSong(SongInput(id = existing.id, score = edge, name = null, number = null)).score shouldBe edge
        }
    }
})
