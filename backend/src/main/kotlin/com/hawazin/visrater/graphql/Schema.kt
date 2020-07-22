package com.hawazin.visrater.graphql

import com.hawazin.visrater.graphql.models.Album
import com.hawazin.visrater.graphql.models.Artist
import com.hawazin.visrater.graphql.models.SearchResult
import com.hawazin.visrater.graphql.models.SearchResultType
import graphql.schema.GraphQLSchema
import graphql.schema.TypeResolver
import graphql.schema.idl.RuntimeWiring
import graphql.schema.idl.SchemaGenerator
import graphql.schema.idl.SchemaParser
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.util.ResourceUtils
import java.io.File

@Configuration
class GraphQLConfiguration {
    @Bean
    fun schema(): GraphQLSchema {
        val parser = SchemaParser()
        val generator = SchemaGenerator()
        val file = loadSchema()
        val typeRegistry = parser.parse(file)
        val typeResolver = searchResultResolver()
        val wiring = buildRunTimeWiring(typeResolver)
        return generator.makeExecutableSchema(typeRegistry, wiring)
    }
}
fun loadSchema(): File = ResourceUtils.getFile("classpath:schema.graphqls")

fun buildRunTimeWiring(searchResultResolver: TypeResolver): RuntimeWiring {
    return RuntimeWiring.newRuntimeWiring()
            .type("Query"
            ) {
                it.dataFetcher("search") { _  -> searchResolver()}
            }
            .type("SearchResult") {
                it.typeResolver(searchResultResolver)
            }
            .build()
}

fun searchResultResolver() : TypeResolver = TypeResolver {
    when (it.getObject() as Any) {
        is Artist -> {
            it.schema.getObjectType("ArtistSearchResult")
        }
        is Album -> {
            it.schema.getObjectType("AlbumSearchResult")
        }
        else -> {
            it.schema.getObjectType("TrackSearchResult")
        }
    }
}

fun searchResolver() : Array<SearchResult>   {
    return arrayOf(Artist("Saadi El Hilli", 1.toString(), SearchResultType.ARTIST))
}




