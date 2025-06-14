package com.hawazin.visualrater.models.api

import com.hawazin.visualrater.models.db.Artist


data class ArtistPage(val totalPages:Int, val pageNumber:Int, val content: MutableList<Artist>)
