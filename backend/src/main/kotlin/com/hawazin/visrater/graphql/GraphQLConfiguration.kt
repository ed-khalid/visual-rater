package com.hawazin.visrater.graphql

import graphql.execution.ExecutionStrategy
import graphql.execution.SubscriptionExecutionStrategy
import graphql.schema.GraphQLSchema
import graphql.schema.idl.SchemaGenerator
import graphql.schema.idl.SchemaParser
import graphql.schema.idl.TypeDefinitionRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.util.ResourceUtils
import java.io.File


@Configuration
class GraphQLConfiguration(private val schemaBuilder: SchemaBuilder, private val asyncTransactionalExecutionStrategy: AsyncTransactionalExecutionStrategy ) {

    @Bean
    fun schema(): GraphQLSchema {
        val generator = SchemaGenerator()
        val files = loadSchemaFiles()
        val typeRegistry = getTypes(files)
        val wiring = schemaBuilder.buildRunTimeWiring()
        return generator.makeExecutableSchema(typeRegistry, wiring)
    }
    @Bean
    fun executionStrategies() : Map<String, ExecutionStrategy> {
        val execStrategyMap = HashMap<String, ExecutionStrategy>()
        execStrategyMap["queryExecutionStrategy"] = asyncTransactionalExecutionStrategy
        return execStrategyMap
    }

    fun getTypes(files:Array<File>): TypeDefinitionRegistry {
        val schemaParser = SchemaParser()
        val typeDefs = TypeDefinitionRegistry()
        files.forEach { typeDefs.merge(schemaParser.parse(it)) }
        return typeDefs
    }
    fun loadSchemaFiles(): Array<File> = arrayOf(
        ResourceUtils.getFile("classpath:basicTypes.graphqls"),
        ResourceUtils.getFile("classpath:queries.graphqls"),
        ResourceUtils.getFile("classpath:mutations.graphqls"),
        ResourceUtils.getFile("classpath:subscriptions.graphqls"),
        ResourceUtils.getFile("classpath:schema.graphqls")
    )

}