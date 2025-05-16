package com.hawazin.visualrater.models.db

import jakarta.persistence.*

@Entity
@Table(name = "genre")
class Genre(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    @Column(length = 40, nullable = false, unique = true)
    var name: String
)

data class Genres(val primary:Genre, val secondary:List<Genre>)




