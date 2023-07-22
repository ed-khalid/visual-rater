package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.graphql.NewAlbumInput
import com.hawazin.visualrater.models.graphql.SongInput
import com.hawazin.visualrater.models.db.*
import com.hawazin.visualrater.models.graphql.ArtistInput
import graphql.GraphqlErrorException
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.util.*


@Service
class MusicService(private val songRepo: SongRepository, private val albumRepo: AlbumRepository, private val artistRepo: ArtistRepository, private val publisherService: PublisherService) {

    @Transactional
    fun readArtists() : Page<Artist> = artistRepo.findAll(PageRequest.of(0,5))
    @Transactional
    fun readArtistByName(name:String) = artistRepo.findByName(name)
    @Transactional
    fun readArtistById(id:UUID) = artistRepo.findById(id)
    @Transactional
    fun readAlbumsForArtist(artistId:UUID) : Iterable<Album> = albumRepo.findByArtistId(artistId)
    @Transactional
    fun readSongsForAlbum(albumId:String) : Iterable<Song>? = songRepo.findByAlbumId(UUID.fromString(albumId))
    @Transactional
    fun deleteSongById(id:UUID) : Boolean
    {
        try {
            songRepo.deleteById(id)
        }
        catch(e:Exception) {
            if (e.message != null) {
                throw GraphqlErrorException.Builder().message(e.message!!).build()
            }
            else {
                throw GraphqlErrorException.Builder().message(e.toString()).build()
            }
        }
        return true
    }

    @Transactional
    fun deleteAlbumById(id:UUID): Boolean
    {
        albumRepo.deleteById(id)
        return true
    }


    @Transactional
    fun notifyOnMetadataUpdate(song:Song)
    {
        val metadata = artistRepo.findMetadataById(song.artistId)
        if (metadata.isPresent) {
            publisherService.notify(metadata.get().metadata)
        }
    }

    @Transactional
    fun compareOtherArtists(songId:String, artistId:String) : Iterable<ComparisonSong>  {
        return songRepo.findComparisonSongsForOtherArtists(UUID.fromString(songId), UUID.fromString(artistId))
    }
    @Transactional
    fun compareOtherAlbumsSameArtist(songId:String, artistId:String, albumId:String) : Iterable<ComparisonSong>  {
        val retv =  songRepo.findComparisonSongsForSameArtist(UUID.fromString(songId), UUID.fromString(artistId), UUID.fromString(albumId))
        return retv
    }


    @Transactional
    fun updateSong(songInput: SongInput) : Song
    {
        val song = songRepo.findById(songInput.id).get()
        song.score = songInput.score ?: song.score
        // if input score is null, ignore update, if it's a negative number, nullify score
        if (song.score != null && song.score!! < 0) {
            song.score = null
        }
        song.name = songInput.name ?: song.name
        song.number = songInput.number ?: song.number
        songRepo.save(song)
        return song
    }

    @Transactional
    fun createArtist(artistInput: ArtistInput): Artist
    {
        var artist:Artist = artistInput.let { Artist(id = null, vendorId= it.vendorId,  name= it.name,thumbnail = it.thumbnail, score  = 0.0, metadata = ArtistMetadata(id = null, tier = 0, songs = ArtistSongMetadata(), totalAlbums = 0, totalSongs = 0  ) )   }
        return artistRepo.save(artist)
    }

    @Transactional
    fun createAlbum(albumInput: NewAlbumInput) : Album
    {
        val maybeArtist = artistRepo.findByName(albumInput.artist.name)
        val artist = if (!maybeArtist.isPresent) createArtist(albumInput.artist) else maybeArtist.get()
        var album = albumInput.let  { Album(id = UUID.randomUUID(),name = it.name, vendorId=it.artist.vendorId,  year= it.year, artistId = artist.id!!, thumbnail = it.thumbnail, score = 0.0, dominantColor = it.dominantColor, songs = null  ) }
        albumRepo.save(album)
        var songs = albumInput.songs.map { Song( id =  UUID.randomUUID(), name = it.name, albumId = album.id!!, artistId = artist.id!!, score = it.score, number= it.number, discNumber = it.discNumber ) }
        songRepo.saveAll(songs)
        album.songs = songs
        return album
    }

//    fun createSong(spotifySong:NewSongInput) : Song
//    {
//        var album:Album? = null
//        var artist:Artist = spotifySong.artist.let { Artist(id = UUID.randomUUID(), name= it.name, vendorId = it.vendorId , thumbnail = it.thumbnail    )   }
//        if (artist.vendorId != null) {
//            val existingArtist  = artistRepo.findByVendorId(artist.vendorId!!)
//            if (existingArtist != null) {
//                artist = existingArtist;
//            } else {
//                artistRepo.save(artist)
//            }
//        }
//        if (spotifySong.album != null) {
//            album = spotifySong.album.let  { Album(id = UUID.randomUUID(), vendorId =  it.vendorId, isComplete=false, name = it.name, year= it.year, artist = artist, thumbnail = it.thumbnail) }
//            if (album.vendorId != null) {
//                val existingAlbum = albumRepo.findByVendorId(album.vendorId!!)
//                if (existingAlbum != null) {
//                    album = existingAlbum
//                } else {
//                    albumRepo.save(album)
//                }
//            }
//        }
//        var song:Song  = spotifySong.let { Song( id =  UUID.randomUUID(),  vendorId = it.vendorId, name = it.name, album = album, artist = artist, score = it.score, number= it.number, discNumber = it.discNumber   ) }
//        songRepo.save(song)
//        return song
//    }
}