package com.hawazin.visrater.graphql

import com.fasterxml.jackson.databind.json.JsonMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.hawazin.visrater.external.SpotifyApi
import com.hawazin.visrater.graphql.models.SongInput
import com.hawazin.visrater.music.MusicService
import graphql.schema.GraphQLSchema
import graphql.schema.idl.RuntimeWiring
import graphql.schema.idl.SchemaGenerator
import graphql.schema.idl.SchemaParser
import graphql.schema.idl.TypeDefinitionRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.util.ResourceUtils
import java.io.File

@Configuration
class GraphQLConfiguration(private val spotifyService:SpotifyApi, private val musicService:MusicService ) {

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
                it.dataFetcher("CreateSong") { env ->
                    val raw = env.arguments["song"]
                    val songInput = objectMapper.convertValue(raw, SongInput::class.java)
                    musicService.createSong(songInput)
                }
            }
                .type("Query"
                ) {
                    it.dataFetcher("artist") { env ->
                        spotifyService.searchArtist(env.arguments["name"] as String)
                    }
                    it.dataFetcher("album") { env ->
                        spotifyService.getAlbumsForArtist(env.arguments["artistId"] as String,  (env.arguments["pageNumber"] as Int?)
                            ?: 0)
                    }
                    it.dataFetcher("track") { env ->
                        spotifyService.getTracksForAlbum(env.arguments["albumId"] as String)
                    }
                }
                .build()
    }
    fun loadSchemaFiles(): Array<File> = arrayOf(
            ResourceUtils.getFile("classpath:schema.graphqls"),
            ResourceUtils.getFile("classpath:queries.graphqls"),
            ResourceUtils.getFile("classpath:mutations.graphqls")
        )

    fun getTypes(files:Array<File>): TypeDefinitionRegistry {
        val schemaParser = SchemaParser()
        val typeDefs = TypeDefinitionRegistry()
        files.forEach { typeDefs.merge(schemaParser.parse(it)) }
        return typeDefs
    }

}



