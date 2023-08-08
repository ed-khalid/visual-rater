package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.Artist
import com.hawazin.visualrater.models.db.ArtistMetadata
import org.reactivestreams.Publisher
import org.reactivestreams.Subscriber
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentLinkedDeque


@Service
class ArtistPublisherService : Publisher<Artist>  {

    val subscribers = ConcurrentLinkedDeque<Subscriber<in Artist>>()

    fun notify(artist: Artist) {
        subscribers.forEach{ it.onNext(artist) }
    }
    override fun subscribe(s: Subscriber<in Artist>?) {
        subscribers.add(s)
    }
}