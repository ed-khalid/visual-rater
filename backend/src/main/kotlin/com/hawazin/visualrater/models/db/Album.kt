package com.hawazin.visualrater.models.db

import io.hypersistence.utils.hibernate.type.array.StringArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import java.time.OffsetDateTime
import java.util.*



@Entity
data class Album(
    @Id var id: UUID,
    var name:String,
    var thumbnail:String?,
    var year:Int,
    @Type(StringArrayType::class)
    @Column(name="thumbnail_dominant_colors", columnDefinition = "text[]")
    var thumbnailDominantColors: Array<String>? = null,
    var score:Double?,
    @Column(name="artistId", insertable =  false, updatable = false)
    val artistId: UUID,
    val vendorId:String?,
    var createdAt: OffsetDateTime?,
    var updatedAt: OffsetDateTime?,
    @OneToMany(cascade = [CascadeType.REMOVE], fetch = FetchType.LAZY)
    @OrderBy("number ASC")
    @JoinColumn(name = "album_id")
    var songs:List<Song>?,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artistId")
    var artist:Artist? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="primary_genre_id", nullable = false)
    var primaryGenre: Genre,
    @ManyToMany
    @JoinTable(
        name = "album_secondary_genre",
        joinColumns = [JoinColumn(name = "album_id")],
        inverseJoinColumns = [JoinColumn(name = "genre_id")]
    )
    var secondaryGenres: MutableList<Genre>,
) {

    val genres:Genres get() =
        Genres(
            primary = primaryGenre,
            secondary = secondaryGenres.toList()
        )




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
