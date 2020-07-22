package com.hawazin.visrater.graphql.models

interface SearchResult  {
    val name:String
    val id:String
    val type:SearchResultType
}
data class Artist(override val id:String, override val name:String, override val type: SearchResultType = SearchResultType.ARTIST, val images: Array<String> = emptyArray()) : SearchResult
data class Album(override val id:String,override val name:String,override val type:SearchResultType = SearchResultType.ALBUM, val images:Array<String> = emptyArray()) : SearchResult
data class Track(override val id:String,override val name:String,override val type:SearchResultType = SearchResultType.ALBUM, val number:Int) : SearchResult

enum class SearchResultType {
    ALBUM, ARTIST, TRACK
}
