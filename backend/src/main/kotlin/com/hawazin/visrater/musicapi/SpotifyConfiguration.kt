package com.hawazin.visrater.musicapi

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding


@ConstructorBinding
@ConfigurationProperties(prefix="spotify")
data class SpotifyConfiguration (
        val accounts:String, val api:String, val client:SpotifyClientConfiguration
) {

    data class SpotifyClientConfiguration(val id:String, val secret:String)
}


