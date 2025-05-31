package com.hawazin.visualrater.scripts

import com.hawazin.visualrater.services.AlbumRepository
import com.hawazin.visualrater.services.ArtistRepository
import com.hawazin.visualrater.services.ImageService
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
@Profile("script")
class UpdateDominantColors(
    private val imageService: ImageService,
    private val artistRepository: ArtistRepository,
    private val albumRepository: AlbumRepository,
) {

    fun updateDominantColors() {
        for (artist in artistRepository.findAll()) {
            val colors = imageService.getTop3DominantColors(artist.thumbnail!!)
            artist.thumbnailDominantColors = colors?.colors?.toTypedArray()
            artist.updatedAt = OffsetDateTime.now()
            artistRepository.save(artist)
            println("Update dominant colors for artist ${artist.name} to ${artist.thumbnailDominantColors} ")
        }
        for (album in albumRepository.findAll()) {
            val colors = imageService.getTop3DominantColors(album.thumbnail!!)
            album.thumbnailDominantColors = colors?.colors?.toTypedArray()
            album.updatedAt = OffsetDateTime.now()
            albumRepository.save(album)
            println("Update dominant colors for album ${album.name} to ${album.thumbnailDominantColors} ")
        }
    }

}