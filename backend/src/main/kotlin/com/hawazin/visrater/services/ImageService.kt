package com.hawazin.visrater.services

import com.hawazin.visrater.configurations.ImageServiceConfiguration
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.getForEntity
import org.springframework.web.client.postForEntity
import org.springframework.web.util.UriComponentsBuilder
import java.util.*


@Service
class ImageService(val configuration: ImageServiceConfiguration) {

    fun groupSimilarAlbums(images:Array<ImageSimilarityRequest>): Array<ImageSimilarityResponse> {
        val template = RestTemplateBuilder()
            .rootUri(configuration.uri)
            .build()
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        headers.accept = Collections.singletonList(MediaType.APPLICATION_JSON)
        val request = HttpEntity<Array<ImageSimilarityRequest>>(images,headers)
        val resp = template.postForEntity<Array<ImageSimilarityResponse>>("/similarity", request, ImageSimilarityResponse::class)
        return resp.body!!
    }

    fun getDominantColor(imageUrl:String) : DominantColorResponse {
        val template = RestTemplateBuilder()
            .rootUri(configuration.uri)
            .build()
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        headers.accept = Collections.singletonList(MediaType.APPLICATION_JSON)
        val resp = template.getForEntity<DominantColorResponse>("/colors?imageUrl={imageUrl}",imageUrl)
        return resp.body!!
    }

    fun removeDuplicates(similarAlbums:Array<ImageSimilarityResponse>, albums:List<SpotifyAlbum>) : List<SpotifyAlbum> {
        val filteredAlbums:List<SpotifyAlbum> = similarAlbums.map<ImageSimilarityResponse, SpotifyAlbum> { it ->
            var albums = it.similarAlbumIds.map { _it -> albums.find { album -> album.id == _it }!! }
            albums.minByOrNull { it.name.length } ?: albums[0]
        }
        return filteredAlbums
    }
}


class DominantColorResponse(val colorString:String)
class ImageSimilarityRequest(val id:String,val imageUrl:String)
class ImageSimilarityResponse(val similarAlbumIds:Array<String>)
