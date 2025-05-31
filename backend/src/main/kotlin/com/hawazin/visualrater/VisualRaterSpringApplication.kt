package com.hawazin.visualrater

import com.hawazin.visualrater.configurations.ImageServiceConfiguration
import com.hawazin.visualrater.configurations.SpotifyConfiguration
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(SpotifyConfiguration::class, ImageServiceConfiguration::class)
class VisualRaterSpringApplication

fun main(args: Array<String>) {
    runApplication<VisualRaterSpringApplication>(*args)
}
