package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import java.util.*

interface GenreRepository : JpaRepository<Genre, Long> {
    fun findByName(name:String): Optional<Genre>
}


interface ArtistRepository: JpaRepository<Artist, UUID>  {
    fun findByName(name:String) : Optional<Artist>
    fun findMetadataById(id:UUID) : Optional<ArtistMetadataProjection>
    fun findByVendorId(vendorId:String): Optional<Artist>
}


interface AlbumRepository: JpaRepository<Album, UUID> {
    fun findByArtistId(artistId: UUID?) : List<Album>
    @Query("""
        select distinct a from Album a  
        LEFT JOIN FETCH a.artist
        LEFT JOIN FETCH a.songs
        WHERE a.score IS NULL
    """)
    fun findUnratedAlbums() : List<Album>
    fun findByVendorId(vendorId:String) : Optional<Album>
}

interface SongRepository:JpaRepository<Song,UUID> {

    fun findByAlbumId(albumId:UUID): Iterable<Song>

    fun findAllByOrderByScoreDesc(pageable: Pageable): Page<Song>

    @Query(nativeQuery = true, value = "SELECT song_id as id, score as songScore, album_name as albumName, artist_name as artistName, album_thumbnail as thumbnail, album_dominant_color as albumDominantColor, song_name as songName FROM get_other_artists_comparison_songs(:songId, :excludedArtistId)")
    fun findComparisonSongsForOtherArtists(@Param("songId")songId:UUID, @Param("excludedArtistId") excludedArtistId:UUID) : Iterable<ComparisonSongProjection>

    @Query(nativeQuery = true, value = "SELECT song_id as id, score as songScore, album_name as albumName, artist_name as artistName, album_thumbnail as thumbnail, album_dominant_color as albumDominantColor, song_name as songName FROM get_artist_comparison_songs(:songId, :artistId, :excludedAlbumId)  ")
    fun findComparisonSongsForSameArtist(@Param("songId")songId:UUID, @Param("artistId") artistId:UUID, @Param("excludedAlbumId") excludedAlbumId: UUID) : Iterable<ComparisonSongProjection>

}
