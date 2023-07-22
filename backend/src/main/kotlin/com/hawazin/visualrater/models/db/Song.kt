package com.hawazin.visualrater.models.db

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import java.util.*

@Entity
data class Song(
    @Id var id: UUID,
    var name:String? = null,
    var number:Int,
    var discNumber:Int,
    val albumId: UUID,
    @JoinColumn(name = "artist_id")
    val artistId: UUID,
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
