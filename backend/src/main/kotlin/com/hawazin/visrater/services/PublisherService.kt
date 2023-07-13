package com.hawazin.visrater.services

import com.hawazin.visrater.models.db.ArtistMetadata
import io.reactivex.rxjava3.core.Observable
import org.springframework.stereotype.Service


@Service
class PublisherService {

    fun notify(metadata: ArtistMetadata) {
        Observable.just(metadata)

    }









}