package com.hawazin.visrater.services

import com.hawazin.visrater.models.db.ArtistMetadata
import io.reactivex.rxjava3.core.BackpressureStrategy
import io.reactivex.rxjava3.core.Observable
import org.springframework.stereotype.Service
import java.util.concurrent.SubmissionPublisher


@Service
class PublisherService {

    val metadataPublisher:SubmissionPublisher<ArtistMetadata> = SubmissionPublisher()


    fun notify(metadata: ArtistMetadata) {
        metadataPublisher.submit(metadata)
    }









}