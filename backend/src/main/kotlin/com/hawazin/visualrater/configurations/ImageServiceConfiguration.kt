package com.hawazin.visualrater.configurations

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.http.MediaType
import org.springframework.web.client.RestClient

@ConfigurationProperties(prefix = "image-service")
class ImageServiceConfiguration(val uri:String) {

    @Bean("imageServiceClient")
    fun imageServiceClient(): RestClient = RestClient.builder()
        .baseUrl(uri)
        .defaultHeaders { headers ->
            headers.contentType = MediaType.APPLICATION_JSON
            headers.accept = listOf(MediaType.APPLICATION_JSON)
        }
        .build()
}