package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.SongInput
import com.hawazin.visualrater.services.MusicService
import com.hawazin.visualrater.services.PublisherService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller
import java.util.*


@Controller
class SongController(val musicService: MusicService) {

    @QueryMapping
    fun songs(@Argument albumId:String): Iterable<Song>? {
        return musicService.readSongsForAlbum(albumId)
    }

    @SchemaMapping
    fun artistId(song:Song): String {
        return song.artist?.id.toString()
    }
    @SchemaMapping
    fun albumId(song:Song): String {
        return song.album?.id.toString()
    }

    @MutationMapping
    fun UpdateSong(@Argument song: SongInput) : Song {
        val song = musicService.updateSong(song)
        musicService.notifyOnMetadataUpdate(song.id)
        return song
    }

    @MutationMapping
    fun DeleteSong(@Argument songId:String) : Boolean {
        return musicService.deleteSongById(UUID.fromString(songId))
    }

}