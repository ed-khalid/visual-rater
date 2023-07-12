package com.hawazin.visrater.graphql
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.hawazin.visrater.models.api.ArtistPage
import com.hawazin.visrater.models.graphql.NewAlbumInput
import com.hawazin.visrater.models.graphql.SongInput
import com.hawazin.visrater.models.db.Artist
import com.hawazin.visrater.models.graphql.ArtistInput
import com.hawazin.visrater.models.graphql.ItemType
import com.hawazin.visrater.models.graphql.ItemType.MUSIC
import com.hawazin.visrater.services.ImageService
import com.hawazin.visrater.services.MusicService
import com.hawazin.visrater.services.SpotifyApi
import graphql.schema.TypeResolver
import graphql.schema.idl.RuntimeWiring
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.*

@Service
class SchemaBuilder(private val spotifyService: SpotifyApi, private val musicService: MusicService, private val imageService: ImageService) {

    private val objectMapper = jacksonObjectMapper()
    private var logger  = LoggerFactory.getLogger(javaClass)

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
                    if (albumInput.thumbnail != null) {
                        val dominantColor = imageService.getDominantColor(albumInput.thumbnail)
                        albumInput.dominantColor = dominantColor.colorString
                    }
                    return@dataFetcher musicService.createAlbum(albumInput)
                }
                it.dataFetcher("DeleteSong") { env ->
                    val id = env.arguments["songId"] as String
                    try {
                        val string = UUID.fromString(id)
                    }
                    catch (e:Exception) {
                        if (e.message != null) {
                            throw VisRaterGraphQLError(e.message!!)
                        } else {
                            throw VisRaterGraphQLError("Shmidreeni")
                        }
                    }
                    return@dataFetcher musicService.deleteSongById(UUID.fromString(id))
                }
                it.dataFetcher("DeleteAlbum") { env ->
                    val id = env.arguments["albumId"] as String
                    return@dataFetcher musicService.deleteAlbumById(UUID.fromString(id))
                }
            }
            .type("Query")
            {
                it.dataFetcher("artist") { env ->
                    val artistName = env.arguments["name"] as String?
                    if (artistName == null) {
                        throw IllegalArgumentException("Artist name not provided")
                    } else {
                        return@dataFetcher musicService.readArtist(artistName)
                    }
                }
                it.dataFetcher("artists") { _ ->
                    try {
                        logger.debug("fetching artists")
                        val artists = musicService.readArtists()
                        logger.debug(artists.toString())
                        return@dataFetcher ArtistPage(
                            total = artists.totalPages,
                            pageNumber = artists.pageable.pageNumber,
                            content = artists.content
                        )
                    }
                    catch(e:Exception) {
                        logger.error(e.message)
                        throw e
                    }
                }
                it.dataFetcher("albums") { env ->
                    val artist = env.getSource<Artist>()
                    return@dataFetcher musicService.readAlbumsForArtist(artist)
                }
                it.dataFetcher("searchExternalAlbumTracks") { env ->
                    spotifyService.getTracksForAlbum(env.arguments["albumId"] as String)
                }
                it.dataFetcher("searchExternalArtist") { env ->
                    val name = env.arguments["name"] as String?
                    if (name != null ) {
                        return@dataFetcher spotifyService.searchArtist(name.toLowerCase())
                    } else {
                        throw IllegalArgumentException("Needs at least one argument")
                    }
                }
            }
            .type("Item") {
                it.typeResolver(itemResolver())
            }
            .type("Page") {
                it.typeResolver(pageResolver())
            }
            .type("Pageable") {
                it.typeResolver(pageableResolver())
            }
            .build()
    }
    fun itemResolver(): TypeResolver = TypeResolver  {
        when(enumValueOf<ItemType>(it.arguments["type"] as String)) {
            MUSIC -> it.schema.getObjectType("Song")
        }
    }

    fun pageResolver() : TypeResolver = TypeResolver {
        it.schema.getObjectType("ArtistPage")
    }
    fun pageableResolver() : TypeResolver = TypeResolver {
        it.schema.getObjectType("Artist")
    }


}



