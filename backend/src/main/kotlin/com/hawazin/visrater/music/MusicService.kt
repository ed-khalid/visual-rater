package com.hawazin.visrater.music

import com.hawazin.visrater.graphql.models.SongInput
import com.hawazin.visrater.music.db.Album
import com.hawazin.visrater.music.db.Artist
import com.hawazin.visrater.music.db.Song
import com.hawazin.visrater.music.db.SongRepository
import org.springframework.stereotype.Service
import java.util.*


@Service
class MusicService(private val songRepo:SongRepository ) {

    fun createSong(spotifySong:SongInput)
    {
        val artist:Artist = spotifySong.artist.let { Artist(id = UUID.randomUUID(), name= it.name, vendorId = it.id  )   }
        val album:Album   = spotifySong.album.let  { Album(id = UUID.randomUUID(), vendorId =  it.id, name = it.name, year= it.year, artist = artist) }
        val song:Song     = spotifySong.let        { Song(UUID.randomUUID(),vendorId = it.id, name = it.name, album = album, artist = artist, score = it.score) }
        songRepo.save(song)
    }
}