package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.api.SongPage
import com.hawazin.visualrater.models.db.Song
import com.hawazin.visualrater.models.graphql.SongInput
import com.hawazin.visualrater.models.graphql.SongQueryParams
import com.hawazin.visualrater.services.MusicCrudService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.*


@Controller
class SongController(private val musicCrudService: MusicCrudService) {

    @QueryMapping
    fun songs(@Argument params:SongQueryParams): SongPage {
        val songs = musicCrudService.readSongs(params)
        return SongPage(totalPages = songs.totalPages, pageNumber = songs.pageable.pageNumber, content = songs.content)
    }

    @MutationMapping
    fun updateSong(@Argument song: SongInput) : Song {
        val newSong  = musicCrudService.updateSong(song)
        musicCrudService.notifyOnSongUpdate(newSong)
        return newSong
    }

    @MutationMapping
    fun deleteSong(@Argument songId:String) : Boolean {
        return musicCrudService.deleteSongById(UUID.fromString(songId))
    }

}