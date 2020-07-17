package com.hawazin.visrater.graphql

import graphql.schema.GraphQLSchema
import graphql.schema.StaticDataFetcher
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
        val wiring = buildRunTimeWiring()
        return generator.makeExecutableSchema(typeRegistry, wiring)
    }
}

fun loadSchema(): File = ResourceUtils.getFile("classpath:schema.graphqls")

fun buildRunTimeWiring(): RuntimeWiring {
    return RuntimeWiring.newRuntimeWiring()
            .type("Query"
            ) {
                it.dataFetcher("search") { _  -> searchResolver()}
            }.build()
}

fun searchResolver() : Array<SearchResult>   {
    return arrayOf(SearchResult("Saadi El Hilli", 1.toString(), SearchResultType.ARTIST ))
}

data class SearchResult(val name:String,val id:String,val type:SearchResultType)

enum class SearchResultType {
    ALBUM, ARTIST, TRACK
}



