package com.hawazin.visualrater.controllers

import com.hawazin.visualrater.models.db.Genre
import com.hawazin.visualrater.services.MusicCrudService
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class GenreController(val musicCrudService: MusicCrudService) {

    @QueryMapping
    fun genres() : Iterable<Genre> {
        val genres = musicCrudService.getAllGenres()
        return genres
    }

}