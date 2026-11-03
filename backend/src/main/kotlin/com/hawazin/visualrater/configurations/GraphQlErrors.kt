package com.hawazin.visualrater.configurations

import graphql.GraphQLError
import graphql.schema.DataFetchingEnvironment
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler
import org.springframework.graphql.execution.ErrorType
import org.springframework.web.bind.annotation.ControllerAdvice

/** A requested entity doesn't exist. Reported to the client as NOT_FOUND. */
class NotFoundException(message: String) : RuntimeException(message)

/** The client sent a value the API won't accept. Reported to the client as BAD_REQUEST. */
class InvalidInputException(message: String) : RuntimeException(message)

/**
 * Maps expected failures to typed GraphQL errors with a readable message.
 * Anything not handled here still becomes Spring's generic INTERNAL_ERROR.
 */
@ControllerAdvice
class GraphQlErrorHandlers {

    @GraphQlExceptionHandler
    fun notFound(e: NotFoundException, env: DataFetchingEnvironment): GraphQLError =
        GraphQLError.newError().errorType(ErrorType.NOT_FOUND).message(e.message)
            .path(env.executionStepInfo.path).location(env.field.sourceLocation).build()

    @GraphQlExceptionHandler
    fun invalidInput(e: InvalidInputException, env: DataFetchingEnvironment): GraphQLError =
        GraphQLError.newError().errorType(ErrorType.BAD_REQUEST).message(e.message)
            .path(env.executionStepInfo.path).location(env.field.sourceLocation).build()
}
