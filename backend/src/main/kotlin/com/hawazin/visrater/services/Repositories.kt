package com.hawazin.visrater.services

import com.hawazin.visrater.models.db.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.CrudRepository
import java.util.*


interface ArtistRepository: JpaRepository<Artist, UUID>   {
    fun findByName(name:String) : Artist?
}

interface AlbumRepository: CrudRepository<Album, UUID> {
    fun findByArtistId(artistId: UUID?) : List<Album>
}

interface SongRepository:CrudRepository<Song,UUID> {
    fun findByName(name:String) : Song?
}
