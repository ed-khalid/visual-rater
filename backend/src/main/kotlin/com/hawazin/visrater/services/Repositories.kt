package com.hawazin.visrater.services

import com.hawazin.visrater.models.db.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.util.*


interface ArtistRepository: JpaRepository<Artist, UUID>   {
    fun findByName(name:String) : Artist?
    @Query("SELECT metadata.id, metadata.tier, metadata.totalAlbums, metadata.totalAlbums, metadata.totalSongs, metadata.songs.classic, metadata.songs.great, metadata.songs.good, metadata.songs.mediocre, metadata.songs.terrible FROM Artist artist INNER JOIN Song song ON Artist.id = song.artist.id INNER JOIN ArtistMetadata metadata ON metadata.artist.id = artist.id WHERE song.id = ?1")
    fun findBySongId(songId:UUID): ArtistMetadata?
}

interface AlbumRepository: CrudRepository<Album, UUID> {
    fun findByArtistId(artistId: UUID?) : List<Album>
}


interface SongRepository:CrudRepository<Song,UUID> {
    fun findByName(name:String) : Song?
}
