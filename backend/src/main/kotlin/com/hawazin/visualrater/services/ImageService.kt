package com.hawazin.visualrater.services

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient


@Service
class ImageService(@Qualifier("imageServiceClient") val imageServiceClient:RestClient) {

    val logger = KotlinLogging.logger {}

    fun getTop3DominantColors(imageUrl: String): TopNDominantColorResponse? =
        try {
            imageServiceClient.get()
                .uri("/top_n_colors?imageUrl=$imageUrl&n_colors=3")
                .retrieve()
                .body(TopNDominantColorResponse::class.java)!!
        } catch (e:Exception) {
            logger.error(e) { "Error retrieving dominant color for image $imageUrl"}
            null
        }
}


class TopNDominantColorResponse(val colors:List<String>)
