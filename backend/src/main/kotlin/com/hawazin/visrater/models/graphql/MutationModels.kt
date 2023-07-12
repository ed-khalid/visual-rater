package com.hawazin.visrater.models.graphql

import java.util.*


data class NewSongInput(val name:String, val score:Double?, val number:Int, val discNumber:Int)
data class NewAlbumInput(val name:String, val thumbnail:String?, val year:Int, val artistId:UUID , val songs:Array<NewSongInput>, var dominantColor:String?)
data class SongInput(val id: UUID, val score:Double?, val name:String?, val number:Int?)
data class ArtistInput(val name:String, val thumbnail:String?)