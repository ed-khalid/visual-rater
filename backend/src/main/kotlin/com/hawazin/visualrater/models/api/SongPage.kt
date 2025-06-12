package com.hawazin.visualrater.models.api

import com.hawazin.visualrater.models.db.Song

data class SongPage(val totalPages:Int, val pageNumber:Int, val content: List<Song>)