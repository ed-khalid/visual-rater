package com.hawazin.visualrater.models.graphql

import java.util.*


data class NewSongInput(val name:String, val score:Double?, val number:Int, val discNumber:Int)
// artistId being a UUID enforces that an artist exists and is created before any new albums can be created
data class NewExternalAlbumInput(val name:String, val thumbnail:String?, val vendorId:String?, val year:Int, val artistId:UUID, val songs:List<NewSongInput>, var dominantColors:List<String>?)
data class UpdateAlbumInput(val name: String, val id:UUID)
data class UpdateArtistInput(val name: String?, val thumbnail:String?, val id:UUID)
data class SongInput(val id: UUID, val score:Double?, val name:String?, val number:Int?)
data class ArtistInput(val name:String, val thumbnail:String?, val vendorId:String?)