package com.hawazin.visualrater.models.db

import org.hibernate.annotations.GenericGenerator
import java.util.*
import jakarta.persistence.*


@Entity
class Artist(
    @Id
    @GeneratedValue(generator = "UUID") @GenericGenerator( name="UUID", strategy =  "org.hibernate.id.UUIDGenerator")
    var id: UUID?,
    var name:String,
    var thumbnail:String?,
    @OneToMany(mappedBy = "artist", cascade = [CascadeType.REMOVE])
    var albums:MutableList<Album>? = null,
    @OneToOne(cascade=[CascadeType.REMOVE, CascadeType.PERSIST])
    var metadata: ArtistMetadata,
    var score:Double
)

@Entity
class ArtistMetadata (
    @Id
    @GeneratedValue(generator = "UUID") @GenericGenerator( name="UUID", strategy =  "org.hibernate.id.UUIDGenerator")
    var id:UUID?,
    var songs: ArtistSongMetadata,
    var totalSongs:Int,
    var totalAlbums:Int,
    var tier:Int
)

abstract class DatabaseEnum<T>(
    open var id:UUID,
    open var value:T
)  {
    constructor(): this(UUID.randomUUID(), null as T ) {
    }
    override fun equals(other: Any?): Boolean {
        return this.toString() == other.toString()
    }
    override fun toString(): String {
        return value.toString()
    }
}




@Embeddable
class ArtistSongMetadata (
    var classic:Int = 0,
    var great: Int = 0,
    var good:Int = 0,
    var mediocre:Int = 0,
    var bad:Int = 0,
    var terrible:Int = 0,
    var classicPercentage:Double = 0.0,
    var greatPercentage:Double = 0.0,
    var goodPercentage:Double = 0.0,
    var mediocrePercentage:Double = 0.0,
    var badPercentage:Double = 0.0,
    var terriblePercentage:Double = 0.0
)

@Entity
class Album(
    @Id var id:UUID,
    var name:String,
    var thumbnail:String?,
    var year:Int,
    var dominantColor:String?,
    var score:Double,
    @ManyToOne @JoinColumn(name="artist_id")
    var artist: Artist,
    @OneToMany(mappedBy="album", cascade = [CascadeType.REMOVE])
    @OrderBy("number ASC")
    var songs:MutableList<Song>? = null
)

@Entity
class Song(
    @Id var id:UUID,
    var name:String? = null,
    var number:Int,
    var discNumber:Int,
    @ManyToOne @JoinColumn(name="album_id") var album: Album? =null,
    @ManyToOne @JoinColumn(name="artist_id") var artist: Artist? = null,
    var score:Double?
)