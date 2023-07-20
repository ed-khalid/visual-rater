package com.hawazin.visualrater.models.db

import org.hibernate.annotations.GenericGenerator
import java.util.*
import jakarta.persistence.*

@Entity
data class Artist(
    @Id
    @GeneratedValue(generator = "UUID") @GenericGenerator( name="UUID", strategy =  "org.hibernate.id.UUIDGenerator")
    var id: UUID?,
    var vendorId:String?,
    var name:String,
    var thumbnail:String?,
    @OneToMany(cascade = [CascadeType.REMOVE], fetch = FetchType.LAZY)
    @JoinColumn(name = "artistId")
    var albums:MutableList<Album>? = null,
    @OneToOne(cascade=[CascadeType.REMOVE, CascadeType.PERSIST])
    var metadata: ArtistMetadata,
    var score:Double
) {

    override fun equals(other: Any?): Boolean {
        return when (other) {
            is Artist -> name == other.name
            else -> false
        }
    }
    override fun hashCode(): Int {
        return name.hashCode() * 17;
    }

}

@Entity
data class Album(
    @Id var id:UUID,
    var name:String,
    var thumbnail:String?,
    var year:Int,
    var dominantColor:String?,
    var score:Double,
    val artistId:UUID,
    val vendorId:String?,
    @OneToMany(cascade = [CascadeType.REMOVE], fetch = FetchType.LAZY)
    @OrderBy("number ASC")
    @JoinColumn(name = "albumId")
    var songs:List<Song>?
) {

    override fun equals(other: Any?): Boolean {
        return when (other) {
            is Album ->  id == other.id
            else -> false
        }
    }

    override fun hashCode(): Int {
        return id.hashCode() * 17
    }

}

@Entity
data class Song(
    @Id var id:UUID,
    var name:String? = null,
    var number:Int,
    var discNumber:Int,
    val albumId:UUID,
    @JoinColumn(name = "artist_id")
    val artistId:UUID,
    var score:Double?
) {

    override fun equals(other: Any?): Boolean {
        return when(other) {
            is Song ->  other.id == id
            else -> false
        }
    }

    override fun hashCode(): Int {
        return id.hashCode() * 17
    }

}

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
