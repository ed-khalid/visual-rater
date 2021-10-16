package com.hawazin.visrater.models.graphql
import com.hawazin.visrater.models.db.Album as ReviewedAlbum
import com.fasterxml.jackson.annotation.JsonAlias

enum class ItemType {
    MUSIC
}

interface SearchResult  {
    val name:String
    val id:String
}
data class Artist(override val id:String, override val name:String, val thumbnail:String?, var unreviewedAlbums:List<Album>, val reviewedAlbums:List<ReviewedAlbum>?) :
    SearchResult
data class Album(override val id:String, override val name:String, val thumbnail:String? , val year:Int ) :
    SearchResult
data class Track(override val id:String,@JsonAlias("disc_number") val discNumber:String, override val name:String, @JsonAlias("track_number")val trackNumber:Int) :
    SearchResult

