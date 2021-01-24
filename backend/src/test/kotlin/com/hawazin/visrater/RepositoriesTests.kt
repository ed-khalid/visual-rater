package com.hawazin.visrater

import com.hawazin.visrater.models.db.*
import com.hawazin.visrater.services.ArtistRepository
import com.hawazin.visrater.services.SongRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import java.util.*


@DataJpaTest
class RepositoriesTests @Autowired constructor(
    val entityManager:TestEntityManager,
    val artistRepo: ArtistRepository,
    val songRepo: SongRepository
) {

    @Test
    fun `When findByName Then Return Artist`() {
        val artist = Artist(UUID.randomUUID(),"random-vendor-id", "Metallica", thumbnail = null)
        entityManager.persist(artist)
        entityManager.flush()
        val found = artistRepo.findByName("Metallica")
        assertThat(found).isEqualTo(artist)
    }

    @Test
    fun  `When Persisting Song, Album, Artist Then They All Get Saved`() {
        val artist = Artist(UUID.randomUUID(),"random-vendor-id", "Britney Spears", null)
        val album = Album(UUID.randomUUID(),"random-vendor-album-id","Baby One More Time", null, false, 1975 ,artist)
        val song = Song(UUID.randomUUID(),"vendor-song-id","Stronger",1,1, album, artist, 7.3 )
        entityManager.persist(artist)
        entityManager.persist(album)
        entityManager.persist(song)
        entityManager.flush()
        val metallica = artistRepo.findByName("Metallica")
        assertThat(metallica).isNull()
        var foundSong = songRepo.findByName("Stronger")
        assertThat(foundSong).isEqualTo(song)
    }
}