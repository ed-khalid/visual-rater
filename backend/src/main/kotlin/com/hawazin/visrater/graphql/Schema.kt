package com.hawazin.visrater.graphql
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.hawazin.visrater.graphql.models.NewSongInput
import com.hawazin.visrater.graphql.models.SongInput
import com.hawazin.visrater.models.graphql.ItemType
import com.hawazin.visrater.models.graphql.ItemType.MUSIC
import com.hawazin.visrater.services.MusicService
import com.hawazin.visrater.services.SpotifyApi
import graphql.schema.GraphQLSchema
import graphql.schema.TypeResolver
import graphql.schema.idl.RuntimeWiring
import graphql.schema.idl.SchemaGenerator
import graphql.schema.idl.SchemaParser
import graphql.schema.idl.TypeDefinitionRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.util.ResourceUtils
import java.io.File
import java.util.*

@Configuration
class GraphQLConfiguration(private val spotifyService: SpotifyApi, private val musicService: MusicService) {

    private final val objectMapper = jacksonObjectMapper()

    @Bean
    fun schema(): GraphQLSchema {
        val generator = SchemaGenerator()
        val files = loadSchemaFiles()
        val typeRegistry = getTypes(files)
        val wiring = buildRunTimeWiring()
        return generator.makeExecutableSchema(typeRegistry, wiring)
    }

    fun buildRunTimeWiring(): RuntimeWiring {
        return RuntimeWiring.newRuntimeWiring()
            .type("Mutation")
            {
                it.dataFetcher("UpdateSong") {  env ->
                    val raw = env.arguments["song"]
                    val songInput = objectMapper.convertValue(raw, SongInput::class.java)
                    musicService.updateSong(songInput)
                }
                it.dataFetcher("CreateSong") { env ->
                    val raw = env.arguments["song"]
                    val songInput = objectMapper.convertValue(raw, NewSongInput::class.java)
                    musicService.createSong(songInput)
                }
                it.dataFetcher("DeleteSong") { env ->
                    val id = env.arguments["songId"] as String
                    musicService.deleteSongById(UUID.fromString(id))
                }
            }
            .type("Query")
            {
                it.dataFetcher("search") { _ ->
                    {}
                }
                it.dataFetcher("items") { env ->
                    when (enumValueOf<ItemType>(env.arguments["type"] as String )) {
                        MUSIC -> {
                            return@dataFetcher musicService.readAllSongs()
                        }
                    }
                }
                it.dataFetcher("song") { env ->
                    try {
                        val songId = env.arguments["id"] as String?
                        val uuid = UUID.fromString(songId)
                        val song = musicService.readSong(id = uuid)
                        return@dataFetcher if (song.isEmpty) null else song
                    }
                    catch (_:IllegalArgumentException)
                    {
                        throw VisRaterGraphQLError("Invalid ID")
                    }
                }
            }
            .type("SearchQuery")
            {
                it.dataFetcher("artists") { env ->
                    spotifyService.searchArtist(env.arguments["name"] as String)
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
    fun loadSchemaFiles(): Array<File> = arrayOf(
            ResourceUtils.getFile("classpath:basicTypes.graphqls"),
            ResourceUtils.getFile("classpath:queries.graphqls"),
            ResourceUtils.getFile("classpath:mutations.graphqls"),
            ResourceUtils.getFile("classpath:schema.graphqls")
        )
    fun itemResolver(): TypeResolver = TypeResolver  {
        when(enumValueOf<ItemType>(it.arguments["type"] as String)) {
            MUSIC -> it.schema.getObjectType("Song")
        }
    }

    fun getTypes(files:Array<File>): TypeDefinitionRegistry {
        val schemaParser = SchemaParser()
        val typeDefs = TypeDefinitionRegistry()
        files.forEach { typeDefs.merge(schemaParser.parse(it)) }
        return typeDefs
    }

}



