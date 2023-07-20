package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.util.*


interface ArtistRepository: JpaRepository<Artist, UUID>   {

    fun findByName(name:String) : Optional<Artist>

    @Query("SELECT artist.metadata FROM Artist artist JOIN Song song WHERE song.artistId = ?1")
    fun findMetadataBySong(artistId:UUID): ArtistMetadata?
}

interface AlbumRepository: CrudRepository<Album, UUID> {
    fun findByArtistId(artistId: UUID?) : List<Album>
}


interface SongRepository:CrudRepository<Song,UUID> {
    fun findByName(name:String) : Song?
    fun findByAlbumId(albumId:UUID): Iterable<Song>?
}
