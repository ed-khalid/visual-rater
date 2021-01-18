package com.hawazin.visrater.graphql
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.hawazin.visrater.graphql.models.NewSongInput
import com.hawazin.visrater.graphql.models.SongInput
import com.hawazin.visrater.models.db.Artist
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
                it.dataFetcher("UpdateAlbum") { env ->
                    val albumId = env.arguments["albumId"] as String
                    val isComplete = env.arguments["isComplete"] as Boolean
                    return@dataFetcher musicService.toggleAlbumCompleteness(albumId,isComplete)
                }
                it.dataFetcher("CreateSong") { env ->
                    val raw = env.arguments["song"]
                    val songInput = objectMapper.convertValue(raw, NewSongInput::class.java)
                    return@dataFetcher musicService.createSong(songInput)
                }
                it.dataFetcher("DeleteSong") { env ->
                    val id = env.arguments["songId"] as String
                    return@dataFetcher musicService.deleteSongById(UUID.fromString(id))
                }
            }
            .type("Query")
            {
                it.dataFetcher("search") { _ ->
                    {}
                }
                it.dataFetcher("artists") { env ->
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
                    val name = env.arguments["name"] as String?
                    if (name != null ) {
                        return@dataFetcher spotifyService.searchArtist(env.arguments["name"] as String)
                    }
                    val id = env.arguments["vendorId"] as String?
                    if (id != null) {
                        return@dataFetcher spotifyService.getArtistById(id)
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



