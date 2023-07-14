package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.ArtistMetadata
import org.reactivestreams.Publisher
import org.reactivestreams.Subscriber
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentLinkedDeque


@Service
class PublisherService : Publisher<ArtistMetadata>  {

    val subscribers = ConcurrentLinkedDeque<Subscriber<in ArtistMetadata>>()

    fun notify(metadata: ArtistMetadata) {
        subscribers.forEach{ it.onNext(metadata) }
    }

    override fun subscribe(s: Subscriber<in ArtistMetadata>?) {
        subscribers.add(s)
    }

}