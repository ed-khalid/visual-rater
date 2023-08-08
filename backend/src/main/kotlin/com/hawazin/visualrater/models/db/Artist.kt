package com.hawazin.visualrater.models.db

import jakarta.persistence.*
import org.hibernate.annotations.GenericGenerator
import java.util.*

@Entity
data class Artist(
    @Id
    @GeneratedValue(generator = "UUID") @GenericGenerator( name="UUID", strategy =  "org.hibernate.id.UUIDGenerator")
    var id: UUID?,
    var vendorId:String?,
    var name:String,
    var thumbnail:String?,
    var dominantColor:String?,
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
        return name.hashCode() * 17
    }

}
