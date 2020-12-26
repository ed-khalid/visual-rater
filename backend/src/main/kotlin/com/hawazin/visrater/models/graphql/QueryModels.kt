package com.hawazin.visrater.models.graphql

import com.fasterxml.jackson.annotation.JsonAlias

enum class ItemType {
    MUSIC
}

interface SearchResult  {
    val name:String
    val vendorId:String
}
data class Artist(override val vendorId:String, override val name:String, val thumbnail:String?, val albums:List<Album>) :
    SearchResult
data class Album(override val vendorId:String, override val name:String, val thumbnail:String? , val year:Int ) :
    SearchResult
data class Track(@JsonAlias("id")override val vendorId:String,@JsonAlias("disc_number") val discNumber:String, override val name:String, @JsonAlias("track_number")val trackNumber:Int) :
    SearchResult

