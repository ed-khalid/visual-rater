package com.hawazin.visrater

import com.hawazin.visrater.music.db.Artist
import com.hawazin.visrater.music.db.ArtistRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.boot.test.context.SpringBootTest
import java.util.*


@DataJpaTest
class RepositoriesTests @Autowired constructor(
    val entityManager:TestEntityManager,
    val artistRepo: ArtistRepository
) {

    @Test
    fun `When findByName Then Return Artist`() {
        val artist = Artist(UUID.randomUUID(),"random-vendor-id", "Metallica")
        entityManager.persist(artist)
        entityManager.flush()
        val found = artistRepo.findByName("Metallica")
        assertThat(found).isEqualTo(artist)
    }
}