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
    var verygood: Int = 0,
    var good:Int = 0,
    var pleasant:Int = 0,
    var decent:Int = 0,
    var interesting:Int = 0,
    var ok:Int = 0,
    var average:Int = 0,
    var meh:Int = 0,
    var boring:Int = 0,
    var poor:Int = 0,
    var bad:Int = 0,
    var offensive:Int = 0,
)
