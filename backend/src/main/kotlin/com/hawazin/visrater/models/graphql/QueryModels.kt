package com.hawazin.visrater.graphql.models

import com.fasterxml.jackson.annotation.JsonAlias

interface SearchResult  {
    val name:String
    val id:String
}
data class Artist(override val id:String, override val name:String, val images: Array<Image> = emptyArray()) : SearchResult
data class Album(override val id:String,override val name:String,val images:Array<Image> = emptyArray(), @JsonAlias("release_date") val year:String ) : SearchResult
data class Track(override val id:String,@JsonAlias("disc_number") val discNumber:String, override val name:String, @JsonAlias("track_number")val trackNumber:Int) : SearchResult
data class PaginatedSearchResult(val results:List<SearchResult>, val pageNumber:Int)
data class Image(val height:Int, val width:Int, val url:String)

