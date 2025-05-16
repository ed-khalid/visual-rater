package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.SongInput
import com.hawazin.visualrater.services.MusicCrudService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller
import java.util.*


@Controller
class SongController(private val musicCrudService: MusicCrudService) {


    @QueryMapping
    fun songs(@Argument albumIds:List<String>): Iterable<Iterable<Song>>? {
        return musicCrudService.readSongsForAlbums(albumIds.map{ UUID.fromString(it) })
    }

    @SchemaMapping
    fun artistId(song:Song): String {
        return song.artistId.toString()
    }
    @SchemaMapping
    fun albumId(song:Song): String {
        return song.albumId.toString()
    }

    @MutationMapping
    fun UpdateSong(@Argument song: SongInput) : Song {
        val newSong  = musicCrudService.updateSong(song)
        musicCrudService.notifyOnSongUpdate(newSong)
        return newSong
    }

    @MutationMapping
    fun DeleteSong(@Argument songId:String) : Boolean {
        return musicCrudService.deleteSongById(UUID.fromString(songId))
    }

}