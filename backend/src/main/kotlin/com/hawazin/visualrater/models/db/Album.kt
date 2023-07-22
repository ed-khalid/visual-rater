package com.hawazin.visualrater.models.db

import jakarta.persistence.*
import java.util.*

@Entity
data class Album(
    @Id var id: UUID,
    var name:String,
    var thumbnail:String?,
    var year:Int,
    var dominantColor:String?,
    var score:Double,
    val artistId: UUID,
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
