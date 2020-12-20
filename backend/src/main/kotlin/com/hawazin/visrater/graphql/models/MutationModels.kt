package com.hawazin.visrater.graphql.models


data class SongInput(val id:String, val name:String, val score:Double, val number:Int, val album:AlbumInput, val artist:ArtistInput)
data class ArtistInput(val id:String, val name:String)
data class AlbumInput(val id:String,val name:String,val year:Int)