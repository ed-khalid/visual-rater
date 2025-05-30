package com.hawazin.visualrater.models.db

import jakarta.persistence.*
import org.hibernate.annotations.GenericGenerator
import java.time.OffsetDateTime
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
    @OneToMany(mappedBy = "artist", cascade = [CascadeType.REMOVE], fetch = FetchType.LAZY)
    var albums:MutableList<Album>? = null,
    @OneToOne(cascade=[CascadeType.REMOVE, CascadeType.PERSIST])
    var metadata: ArtistMetadata,
    @ManyToOne
    @JoinColumn(name ="primary_genre_id", nullable = false)
    var primaryGenre: Genre,
    @ManyToMany
    @JoinTable(
        name = "artist_secondary_genre",
        joinColumns = [JoinColumn(name = "artist_id")],
        inverseJoinColumns = [JoinColumn(name = "genre_id")]
    )
    var secondaryGenres: MutableList<Genre>,
    var score:Double?,
    var createdAt: OffsetDateTime?,
    var updatedAt: OffsetDateTime?,
) {

    val genres:Genres get() =
        Genres(
            primary = primaryGenre,
            secondary = secondaryGenres.toList()
        )

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
