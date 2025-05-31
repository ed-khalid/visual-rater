package com.hawazin.visualrater.models.db

import jakarta.persistence.*
import java.time.OffsetDateTime
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
    var score:Double?,
    var createdAt: OffsetDateTime?,
    var updatedAt: OffsetDateTime?,
    @ManyToOne
    @JoinColumn(name ="primary_genre_id", nullable = false)
    var primaryGenre: Genre,
    @ManyToMany
    @JoinTable(
        name = "song_secondary_genre",
        joinColumns = [JoinColumn(name = "song_id")],
        inverseJoinColumns = [JoinColumn(name = "genre_id")]
    )
    var secondaryGenres: MutableList<Genre>,

    @OneToOne(mappedBy = "song", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    private var shortNameEntity: SongShortname? = null
) {

    var shortname: String?
        get() = shortNameEntity?.shortName
        set(newShortName: String?) {
            newShortName?.let {
                shortNameEntity?.let {
                    it.shortName = newShortName
                }  ?: run {
                    shortNameEntity = SongShortname(
                        shortName = newShortName,
                        song = this
                    )
                }
            } ?: run {
                shortNameEntity = null
            }
        }

    val genres:Genres get() =
        Genres(
            primary = primaryGenre,
            secondary = secondaryGenres.toList()
        )
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
