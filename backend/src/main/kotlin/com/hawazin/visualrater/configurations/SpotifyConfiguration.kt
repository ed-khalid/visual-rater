package com.hawazin.visualrater.configurations

import org.springframework.boot.context.properties.ConfigurationProperties


@ConfigurationProperties(prefix="spotify")
data class SpotifyConfiguration (
        val accounts:String, val api:String, val client: SpotifyClientConfiguration
) {

    data class SpotifyClientConfiguration(val id:String, val secret:String)
}


