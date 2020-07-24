package com.hawazin.visrater.graphql.models

import com.fasterxml.jackson.annotation.JsonIgnore

interface SearchResult  {
    val name:String
    val id:String
    val type:SearchResultType
}
data class Artist(override val id:String, override val name:String, @JsonIgnore override val type: SearchResultType = SearchResultType.ARTIST, val images: Array<Image> = emptyArray()) : SearchResult
data class Album(override val id:String,override val name:String,override val type:SearchResultType = SearchResultType.ALBUM, val images:Array<Image> = emptyArray()) : SearchResult
data class Track(override val id:String,override val name:String,override val type:SearchResultType = SearchResultType.ALBUM, val number:Int) : SearchResult

data class Image(val height:Int, val width:Int, val url:String)

enum class SearchResultType {
    ALBUM, ARTIST, TRACK
}
