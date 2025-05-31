package com.hawazin.visualrater.models.graphql
import com.fasterxml.jackson.annotation.JsonAlias
import java.util.UUID

interface SearchResult  {
    val name:String
    val id:String
}
data class ArtistSearchParams(val name: String? = null, val id: UUID? = null)
data class ExternalSearchArtist(override val id:String, override val name:String, val thumbnail:String?, val albums:List<ExternalSearchAlbum>):
    SearchResult
data class ExternalSearchAlbum(override val id:String, override val name:String, val thumbnail:String?, val year:Int) :
    SearchResult
data class ExternalSearchTracks(override val id:String, @JsonAlias("disc_number") val discNumber:Int, override val name:String, @JsonAlias("track_number")val trackNumber:Int) :
    SearchResult