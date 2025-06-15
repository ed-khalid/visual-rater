package com.hawazin.visualrater.models.api

import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Song

data class SongPage(val totalPages:Int, val pageNumber:Int, val content: List<Song>)
data class AlbumPage(val totalPages:Int, val pageNumber:Int, val content: List<Album>)
