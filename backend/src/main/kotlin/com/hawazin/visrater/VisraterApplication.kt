package com.hawazin.visrater

import com.hawazin.visrater.configurations.SpotifyConfiguration
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication


@SpringBootApplication
@EnableConfigurationProperties(SpotifyConfiguration::class)
class VisraterApplication {

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            runApplication<VisraterApplication>(*args)
        }
    }
}


