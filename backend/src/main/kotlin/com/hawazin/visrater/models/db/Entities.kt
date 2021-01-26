package com.hawazin.visrater.models.db

import java.util.*
import javax.persistence.*


@Entity
class Artist(
    @Id var id: UUID,
    var vendorId:String?,
    var name:String,
    var thumbnail:String?,
    @OneToMany(mappedBy = "artist", cascade = arrayOf(CascadeType.REMOVE)) var albums:MutableList<Album>? = null
)

@Entity
class Album(
    @Id var id:UUID,
    var vendorId:String?,
    var name:String,
    var thumbnail:String?,
    var isComplete:Boolean,
    var year:Int,
    @ManyToOne @JoinColumn(name="artist_id") var artist:Artist,
    @OneToMany(mappedBy="album", cascade = arrayOf(CascadeType.REMOVE) )
    @OrderBy("number ASC")
    var songs:MutableList<Song>? = null
)

@Entity
class Song(
    @Id var id:UUID,
    var vendorId:String? = null,
    var name:String? = null,
    var number:Int,
    var discNumber:Int,
    @ManyToOne @JoinColumn(name="album_id") var album:Album? =null,
    @ManyToOne @JoinColumn(name="artist_id") var artist:Artist? = null,
    var score:Double?
)