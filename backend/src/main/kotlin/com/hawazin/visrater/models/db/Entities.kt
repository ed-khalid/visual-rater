package com.hawazin.visrater.models.db

import java.util.*
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.ManyToOne


@Entity
class Artist(
    @Id var id: UUID,
    var vendorId:String,
    var name:String,
    var thumbnail:String?
)

@Entity
class Album(
    @Id var id:UUID,
    var vendorId:String,
    var name:String,
    var thumbnail:String?,
    var year:Int,
    @ManyToOne var artist:Artist
)

@Entity
class Song(
    @Id var id:UUID,
    var vendorId:String,
    var name:String,
    @ManyToOne var album:Album,
    @ManyToOne var artist:Artist,
    var score:Double
)