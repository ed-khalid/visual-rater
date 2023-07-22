package com.hawazin.visualrater.models.db

import org.hibernate.annotations.GenericGenerator
import java.util.*
import jakarta.persistence.*

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
