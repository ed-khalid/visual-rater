package com.hawazin.visrater.graphql
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.hawazin.visrater.models.graphql.NewAlbumInput
import com.hawazin.visrater.models.graphql.SongInput
import com.hawazin.visrater.models.db.Artist
import com.hawazin.visrater.models.graphql.ArtistInput
import com.hawazin.visrater.models.graphql.ItemType
import com.hawazin.visrater.models.graphql.ItemType.MUSIC
import com.hawazin.visrater.services.MusicService
import com.hawazin.visrater.services.SpotifyApi
import graphql.schema.TypeResolver
import graphql.schema.idl.RuntimeWiring
import org.springframework.stereotype.Service
import java.util.*

@Service
class SchemaBuilder(private val spotifyService: SpotifyApi, private val musicService: MusicService) {

    private final val objectMapper = jacksonObjectMapper()

    fun buildRunTimeWiring(): RuntimeWiring {
        return RuntimeWiring.newRuntimeWiring()
            .type("Mutation")
            {
                it.dataFetcher("UpdateSong") {  env ->
                    val raw = env.arguments["song"]
                    val songInput = objectMapper.convertValue(raw, SongInput::class.java)
                    return@dataFetcher musicService.updateSong(songInput)
                }
                it.dataFetcher("CreateArtist") { env ->
                    val raw = env.arguments["artist"]
                    var artistInput = objectMapper.convertValue(raw, ArtistInput::class.java)
                    return@dataFetcher musicService.createArtist(artistInput)

                }
                it.dataFetcher("CreateAlbum") { env ->
                    val raw = env.arguments["album"]
                    val albumInput = objectMapper.convertValue(raw, NewAlbumInput::class.java)
                    return@dataFetcher musicService.createAlbum(albumInput)
                }
                it.dataFetcher("DeleteSong") { env ->
                    val id = env.arguments["songId"] as String
                    return@dataFetcher musicService.deleteSongById(UUID.fromString(id))
                }
                it.dataFetcher("DeleteAlbum") { env ->
                    val id = env.arguments["albumId"] as String
                    return@dataFetcher musicService.deleteAlbumById(UUID.fromString(id))
                }
            }
            .type("Query")
            {
                it.dataFetcher("search") { env ->
                    data class ReturnValue(val id: String)
                    var id = env.selectionSet.arguments["artist"]?.get("name") as String?
                    if (id == null) {
                       id = env.variables?.get("albumId") as String?
                    }
                    return@dataFetcher ReturnValue(id = id!!.toLowerCase())
                }
                it.dataFetcher("artists") { _ ->
                    val artists = musicService.readArtists()
                    return@dataFetcher artists
                }
                it.dataFetcher("albums") { env ->
                    val artist  = env.getSource<Artist>()
                    val album = musicService.readAlbumsForArtist(artist)
                    return@dataFetcher album
                }
//                it.dataFetcher("song") { env ->
//                    try {
//                        val songId = env.arguments["id"] as String?
//                        val uuid = UUID.fromString(songId)
//                        val song = musicService.readSong(id = uuid)
//                        return@dataFetcher if (song.isEmpty) null else song
//                    }
//                    catch (_:IllegalArgumentException)
//                    {
//                        throw VisRaterGraphQLError("Invalid ID")
//                    }
//                }
            }
            .type("SearchQuery")
            {
                it.dataFetcher("artist") { env ->
                    val id = env.arguments["vendorId"] as String?
                    if (id != null) {
                        return@dataFetcher spotifyService.getArtistById(id)
                    }
                    val name = env.arguments["name"] as String?
                    if (name != null ) {
                        return@dataFetcher spotifyService.searchArtist(name.toLowerCase())
                    } else {
                        throw IllegalArgumentException("Needs at least one argument")
                    }
                }
                it.dataFetcher("tracks") { env ->
                    spotifyService.getTracksForAlbum(env.arguments["albumId"] as String)
                }
             }
            .type("Item") {
                it.typeResolver(itemResolver())
            }
             .build()
    }
    fun itemResolver(): TypeResolver = TypeResolver  {
        when(enumValueOf<ItemType>(it.arguments["type"] as String)) {
            MUSIC -> it.schema.getObjectType("Song")
        }
    }


}



