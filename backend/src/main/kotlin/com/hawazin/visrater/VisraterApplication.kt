package com.hawazin.visrater

import com.hawazin.visrater.musicapi.SpotifyConfiguration
import graphql.Scalars
import graphql.schema.GraphQLFieldDefinition
import graphql.schema.GraphQLObjectType
import graphql.schema.GraphQLSchema
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean

@SpringBootApplication
@EnableConfigurationProperties(SpotifyConfiguration::class)
class VisraterApplication {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            runApplication<VisraterApplication>(*args)
        }
    }

    @Bean
    fun schema(): GraphQLSchema {
            return GraphQLSchema.newSchema()
                    .query(GraphQLObjectType.newObject()
                            .name("query")
                            .field { field: GraphQLFieldDefinition.Builder -> field
                                    .name("test")
                                    .type(Scalars.GraphQLString)
                                    .dataFetcher { _ ->  "response" }
                            }.build()
                            ).build()
    }
}
