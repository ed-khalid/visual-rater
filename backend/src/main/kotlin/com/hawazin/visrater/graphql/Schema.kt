package com.hawazin.visrater.graphql

import com.hawazin.visrater.musicapi.SpotifyApi
import graphql.schema.GraphQLSchema
import graphql.schema.idl.RuntimeWiring
import graphql.schema.idl.SchemaGenerator
import graphql.schema.idl.SchemaParser
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.util.ResourceUtils
import java.io.File

@Configuration
class GraphQLConfiguration(private val spotifyService:SpotifyApi) {
    @Bean
    fun schema(): GraphQLSchema {
        val parser = SchemaParser()
        val generator = SchemaGenerator()
        val file = loadSchema()
        val typeRegistry = parser.parse(file)
//        val typeResolver = searchResultResolver()
        val wiring = buildRunTimeWiring()
        return generator.makeExecutableSchema(typeRegistry, wiring)
    }

    fun buildRunTimeWiring(): RuntimeWiring {
        return RuntimeWiring.newRuntimeWiring()
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
//                .type("SearchResult") {
//                    it.typeResolver(searchResultResolver)
//                }
                .build()
    }
fun loadSchema(): File = ResourceUtils.getFile("classpath:schema.graphqls")

//fun searchResultResolver() : TypeResolver = TypeResolver {
//    when (it.getObject() as Any) {
//        is Artist -> {
//            it.schema.getObjectType("ArtistSearchResult")
//        }
//        is Album -> {
//            it.schema.getObjectType("AlbumSearchResult")
//        }
//        else -> {
//            it.schema.getObjectType("TrackSearchResult")
//        }
//    }
//}

}



