package com.hawazin.visrater.graphql.models

import java.util.*


data class NewSongInput(val vendorId:String?, val name:String, val score:Double, val number:Int, val album:AlbumInput?, val discNumber:Int, val artist:ArtistInput)
data class SongInput(val id: UUID, val score:Double)
data class ArtistInput(val vendorId:String?, val name:String, val thumbnail:String?)
data class AlbumInput(val vendorId:String?,val name:String,val year:Int, val thumbnail:String?)