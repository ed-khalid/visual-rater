package com.hawazin.visrater.services

import com.hawazin.visrater.graphql.models.SongInput
import com.hawazin.visrater.models.db.*
import org.springframework.stereotype.Service
import java.util.*


@Service
class MusicService(private val songRepo:SongRepository , private val albumRepo: AlbumRepository, private val artistRepo:ArtistRepository) {


    fun readAllSongs() : Iterable<Song>
    {
        return songRepo.findAll()
    }

    fun createSong(spotifySong:SongInput) : Song
    {
        var artist:Artist = spotifySong.artist.let { Artist(id = UUID.randomUUID(), name= it.name, vendorId = it.id  )   }
        var album:Album   = spotifySong.album.let  { Album(id = UUID.randomUUID(), vendorId =  it.id, name = it.name, year= it.year, artist = artist) }

        val existingArtist  = artistRepo.findByVendorId(artist.vendorId)
        if (existingArtist != null) {
            artist = existingArtist;
        } else {
            artistRepo.save(artist)
        }
        val existingAlbum = albumRepo.findByVendorId(album.vendorId)
        if (existingAlbum != null) {
            album = existingAlbum
        } else {
            albumRepo.save(album)
        }
        var song:Song  = spotifySong.let { Song( id = UUID.randomUUID(),  vendorId = it.id, name = it.name, album = album, artist = artist, score = it.score) }
        val existingSong = songRepo.findByVendorId(song.vendorId)
        if (existingSong != null) {
            song.id = existingSong.id
        }
        songRepo.save(song)
        return song
    }
}