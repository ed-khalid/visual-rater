package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.Album
import com.hawazin.visualrater.models.db.Artist
import org.reactivestreams.Publisher
import org.reactivestreams.Subscriber
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentLinkedDeque



open class PublisherService<T> : Publisher<T>  {

    val subscribers = ConcurrentLinkedDeque<Subscriber<in T>>()

    fun notify(newEntity: T) {
        subscribers.forEach{ it.onNext(newEntity) }
    }
    override fun subscribe(s: Subscriber<in T>?) {
        subscribers.add(s)
    }
}

@Service
class AlbumPublisher : PublisherService<Album>()
@Service
class ArtistPublisher : PublisherService<Artist>()
