package com.hawazin.visrater.graphql.models

import com.fasterxml.jackson.annotation.JsonAlias
import com.fasterxml.jackson.annotation.JsonIgnore

interface SearchResult  {
    val name:String
    val id:String
    val type:SearchResultType
}
data class Artist(override val id:String, override val name:String, @JsonIgnore override val type: SearchResultType = SearchResultType.ARTIST, val images: Array<Image> = emptyArray()) : SearchResult
data class Album(override val id:String,override val name:String,@JsonIgnore override val type:SearchResultType = SearchResultType.ALBUM, val images:Array<Image> = emptyArray()) : SearchResult
data class Track( override val id:String,@JsonAlias("disc_number") val discNumber:String, override val name:String, @JsonIgnore override val type:SearchResultType = SearchResultType.TRACK, @JsonAlias("track_number")val number:Int) : SearchResult
data class QueryResponse(val results:List<SearchResult>, val pageNumber:Int)

data class Image(val height:Int, val width:Int, val url:String)

enum class SearchResultType {
    ALBUM, ARTIST, TRACK
}
