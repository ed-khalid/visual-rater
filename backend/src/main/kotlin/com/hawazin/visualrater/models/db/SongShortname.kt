package com.hawazin.visualrater.models.db

import jakarta.persistence.*

@Entity
@Table(name="song_linear_rater_shortname")
class SongShortname(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var shortName: String,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false, unique = true)
    val song:Song
)