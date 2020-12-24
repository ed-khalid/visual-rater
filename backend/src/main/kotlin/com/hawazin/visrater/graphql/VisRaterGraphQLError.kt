package com.hawazin.visrater.graphql

import graphql.GraphQLError
import java.lang.RuntimeException

class VisRaterGraphQLError(@JvmField override val message:String) : GraphQLError, RuntimeException(message) {
    override fun getMessage() = message
    override fun getLocations() = null
    override fun getErrorType() = null
}