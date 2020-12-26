package com.hawazin.visrater.services

import com.hawazin.visrater.graphql.models.NewSongInput
import com.hawazin.visrater.graphql.models.SongInput
import com.hawazin.visrater.models.db.*
import org.springframework.stereotype.Service
import java.util.*


@Service
class MusicService(private val songRepo:SongRepository , private val albumRepo: AlbumRepository, private val artistRepo:ArtistRepository) {

    fun readAllSongs() : Iterable<Song> = songRepo.findAll()
    fun readSong(id:UUID) : Optional<Song> = songRepo.findById(id)
    fun deleteSongById(id:UUID) : Boolean
    {
        songRepo.deleteById(id)
        return true
    }

    fun updateSong(songInput: SongInput) : Song
    {
        val song = songRepo.findById(songInput.id).get()
        song.score = songInput.score
        songRepo.save(song)
        return song
    }

    fun createSong(spotifySong:NewSongInput) : Song
    {
        var album:Album? = null ;
        var artist:Artist = spotifySong.artist.let { Artist(id = UUID.randomUUID(), name= it.name, vendorId = it.vendorId , thumbnail = it.thumbnail    )   }
        if (artist.vendorId != null) {
            val existingArtist  = artistRepo.findByVendorId(artist.vendorId!!)
            if (existingArtist != null) {
                artist = existingArtist;
            } else {
                artistRepo.save(artist)
            }
        }
        if (spotifySong.album != null) {
            album = spotifySong.album.let  { Album(id = UUID.randomUUID(), vendorId =  it.vendorId, name = it.name, year= it.year, artist = artist, thumbnail = it.thumbnail) }
            if (album.vendorId != null) {
                val existingAlbum = albumRepo.findByVendorId(album.vendorId!!)
                if (existingAlbum != null) {
                    album = existingAlbum
                } else {
                    albumRepo.save(album)
                }
            }
        }
        var song:Song  = spotifySong.let { Song( id =  UUID.randomUUID(),  vendorId = it.vendorId, name = it.name, album = album, artist = artist, score = it.score  ) }
        songRepo.save(song)
        return song
    }
}