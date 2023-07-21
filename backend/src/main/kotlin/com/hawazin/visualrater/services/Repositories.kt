package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.CrudRepository
import java.util.*


interface ArtistMetadataProjection {
    val metadata:ArtistMetadata
}

interface ArtistRepository: JpaRepository<Artist, UUID>   {

    fun findByName(name:String) : Optional<Artist>
    fun findMetadataById(id:UUID) : Optional<ArtistMetadataProjection>
}


interface AlbumRepository: CrudRepository<Album, UUID> {
    fun findByArtistId(artistId: UUID?) : List<Album>
}


interface SongRepository:CrudRepository<Song,UUID> {
    fun findByName(name:String) : Song?
    fun findByAlbumId(albumId:UUID): Iterable<Song>?
}
