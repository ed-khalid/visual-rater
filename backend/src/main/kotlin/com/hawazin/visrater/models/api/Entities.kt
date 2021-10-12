package com.hawazin.visrater.models.api

import com.hawazin.visrater.models.db.Artist


data class ArtistPage(val total:Int, val pageNumber:Int, val content: MutableList<Artist>)
