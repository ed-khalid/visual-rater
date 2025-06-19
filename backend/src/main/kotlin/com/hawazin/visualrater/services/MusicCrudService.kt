package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.*
import com.hawazin.visualrater.models.graphql.*
import graphql.GraphqlErrorException
import jakarta.persistence.criteria.JoinType
import jakarta.persistence.criteria.Predicate
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.*


@Service
class MusicCrudService(private val genreRepo: GenreRepository, private val songRepo: SongRepository, private val albumRepo: AlbumRepository, private val artistRepo: ArtistRepository, private val artistPublisherService: PublisherService<Artist>, private val albumPublisherService: PublisherService<Album>) {

    val unratedGenre = genreRepo.findByName("NOT CHOSEN").get()

    fun getAllGenres(): Page<Genre> = genreRepo.findAll(PageRequest.of(0, 50))

    fun artistFilterSpec(params:ArtistQueryParams): Specification<Artist> = Specification { root, query, cb ->
        val predicates = mutableListOf<Predicate>()

        predicates += cb.isNotNull(root.get<Double>("score"))

        params.score?.let {
            predicates += cb.lessThanOrEqualTo(root.get("score"), it)
        }
        params.genres?.takeIf { it.isNotEmpty() }?.let {
            val primaryGenreJoin = root.join<Album,Genre>("primaryGenre")
            predicates += primaryGenreJoin.`in`(it)
            val secondaryGenresJoin = root.join<Album,Genre>("secondaryGenres", JoinType.LEFT)
            predicates += secondaryGenresJoin.`in`(it)
        }
        params.name?.let {
            predicates += cb.equal(root.get<String>("name"), it)
        }
        query?.distinct(true)
        cb.and(*predicates.toTypedArray())
    }

    fun albumFilterSpec(params:AlbumQueryParams): Specification<Album> = Specification { root, query, cb ->
        val predicates = mutableListOf<Predicate>()

        predicates += cb.isNotNull(root.get<Double>("score"))

        params.artistIds?.takeIf { it.isNotEmpty() }?.let {
            predicates += root.join<Album, Artist>("artist").get<UUID>("id").`in`(it)
        }
        params.score?.let {
            predicates += cb.lessThanOrEqualTo(root.get("score"), it)
        }
        params.genres?.takeIf { it.isNotEmpty() }?.let {
            val primaryGenreJoin = root.join<Album,Genre>("primaryGenre")
            predicates += primaryGenreJoin.`in`(it)
            val secondaryGenresJoin = root.join<Album,Genre>("secondaryGenres", JoinType.LEFT)
            predicates += secondaryGenresJoin.`in`(it)
        }
        params.year?.let {
            predicates += cb.lessThanOrEqualTo(root.get("year"), it)
        }
        query?.distinct(true)
        cb.and(*predicates.toTypedArray())
    }

    fun songFilterSpec(params:SongQueryParams): Specification<Song> = Specification { root, query, cb ->
        val predicates = mutableListOf<Predicate>()

        predicates += cb.isNotNull(root.get<Double>("score"))

        params.artistIds?.takeIf { it.isNotEmpty() }?.let {
            predicates += root.join<Song, Artist>("artist").get<UUID>("id").`in`(it)
        }
        params.albumIds?.takeIf { it.isNotEmpty() }?.let {
            predicates += root.join<Song, Album>("album").get<UUID>("id").`in`(it)
        }
        params.score?.let {
            predicates += cb.lessThanOrEqualTo(root.get("score"), it)
        }
        params.genres?.takeIf { it.isNotEmpty() }?.let {
            val primaryGenreJoin = root.join<Song,Genre>("primaryGenre")
            predicates += primaryGenreJoin.`in`(it)
            val secondaryGenresJoin = root.join<Song,Genre>("secondaryGenres", JoinType.LEFT)
            predicates += secondaryGenresJoin.`in`(it)
        }
        params.year?.let {
            val albumJoin = root.join<Song, Album>("album")
            predicates += cb.equal(cb.function("year", Int::class.java, albumJoin.get<Int>("year")), it)
        }
        query?.distinct(true)
        cb.and(*predicates.toTypedArray())
    }

    fun readAlbums(params:AlbumQueryParams): Page<Album> {
        val spec = albumFilterSpec(params)
        return albumRepo.findAll(spec, PageRequest.of(params.pageNumber, 50, Sort.by(Sort.Direction.DESC, "score")) )
    }
    fun readSongs(params:SongQueryParams): Page<Song> {
        val spec = songFilterSpec(params)
        return songRepo.findAll(spec, PageRequest.of(params.pageNumber, 100, Sort.by(Sort.Direction.DESC, "score")) )
    }
    fun readArtists(params:ArtistQueryParams) : Page<Artist> {
        val spec = artistFilterSpec(params)
        return artistRepo.findAll(spec, PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "score")))
    }

    fun readArtistById(id:UUID) = artistRepo.findById(id)
    fun readAlbumById(id:UUID) = albumRepo.findById(id)

    @Transactional
    fun deleteArtistById(id:UUID): Boolean {
        try {
            artistRepo.deleteById(id)
        }
        catch(e:Exception) {
            if (e.message != null) {
                throw GraphqlErrorException.Builder().message(e.message!!).build()
            }
            else {
                throw GraphqlErrorException.Builder().message(e.toString()).build()
            }
        }
        return true
    }

    @Transactional
    fun deleteSongById(id:UUID) : Boolean
    {
        try {
            songRepo.deleteById(id)
        }
        catch(e:Exception) {
            if (e.message != null) {
                throw GraphqlErrorException.Builder().message(e.message!!).build()
            }
            else {
                throw GraphqlErrorException.Builder().message(e.toString()).build()
            }
        }
        return true
    }

    @Transactional
    fun deleteAlbumById(id:UUID): Boolean
    {
        albumRepo.deleteById(id)
        return true
    }


    @Transactional
    fun notifyOnSongUpdate(song:Song)
    {
        song.artist?.let {
            artistPublisherService.notify(it)
        }
        song.album?.let {
            albumPublisherService.notify(it)
        }
    }

    @Transactional
    fun compareOtherSongsOtherArtists(songId:String, artistId:String) : Iterable<ComparisonSongProjection>  {
        return songRepo.findComparisonSongsForOtherArtists(UUID.fromString(songId), UUID.fromString(artistId))
    }
    @Transactional
    fun compareOtherSongsSameArtist(songId:String, artistId:String, albumId:String) : Iterable<ComparisonSongProjection>  {
        val retv =  songRepo.findComparisonSongsForSameArtist(UUID.fromString(songId), UUID.fromString(artistId), UUID.fromString(albumId))
        return retv
    }

    @Transactional
    fun updateArtist(artistInput: UpdateArtistInput): Artist   {
        val artist = artistRepo.findById(artistInput.id).get()
        artistInput.name?.let {
            artist.name = it
        }
        artistInput.thumbnail?.let {
            artist.thumbnail = it
        }
        artistRepo.save(artist)
        return artist
    }

    @Transactional
    fun updateAlbum(albumInput: UpdateAlbumInput): Album {
        val album = albumRepo.findById(albumInput.id).get()
        album.name = albumInput.name
        album.updatedAt = OffsetDateTime.now()
        albumRepo.save(album)
        return album
    }


    @Transactional
    fun updateSong(songInput: SongInput) : Song
    {
        val song = songRepo.findById(songInput.id).get()
        song.score = songInput.score ?: song.score
        // if input score is null, ignore update, if it's a negative number, nullify score
        if (song.score != null && song.score!! < 0) {
            song.score = null
        }
        song.name = songInput.name ?: song.name
        song.number = songInput.number ?: song.number
        song.updatedAt = OffsetDateTime.now()
        songRepo.save(song)
        return song
    }


    @Transactional
    fun createArtist(artistInput: ArtistInput, dominantColors: List<String>?): Artist
    {
        val maybeArtist = artistRepo.findByName(artistInput.name)
        if (!maybeArtist.isPresent) {
            val artist:Artist = artistInput.let { Artist(id = null, vendorId= it.vendorId, name= it.name,thumbnail = it.thumbnail, score  = 0.0, metadata = ArtistMetadata(id = null, tier = 0, songs = ArtistSongMetadata(), totalAlbums = 0, totalSongs = 0 , ), thumbnailDominantColors =  dominantColors?.toTypedArray() , createdAt = OffsetDateTime.now(), updatedAt = null, primaryGenre = unratedGenre, secondaryGenres = mutableListOf()   )   }
            return artistRepo.save(artist)
        } else
       return maybeArtist.get()
    }

    @Transactional
    fun createAlbum(albumInput: NewExternalAlbumInput) : Album
    {
        val maybeArtist = artistRepo.findById(albumInput.artistId)
        if (!maybeArtist.isPresent) {
            throw IllegalStateException("cannot create an album for a nonexistent artist ${albumInput.artistId}")
        }
        val artist = maybeArtist.get()
        val album = albumInput.let  { Album(id = UUID.randomUUID(),name = it.name, vendorId=it.vendorId, artist = artist, year= it.year, thumbnail = it.thumbnail, score = 0.0, thumbnailDominantColors = it.dominantColors?.toTypedArray(), songs = null, createdAt = OffsetDateTime.now(), updatedAt = null, primaryGenre = unratedGenre, secondaryGenres = mutableListOf()  ) }
        val newAlbum = albumRepo.save(album)
        val songs = albumInput.songs.map { Song( id =  UUID.randomUUID(), name = it.name, album = newAlbum, artist = artist, score = it.score, number= it.number, createdAt = OffsetDateTime.now(), updatedAt = null, primaryGenre = unratedGenre, secondaryGenres = mutableListOf(), vendorId = it.id  ) }
        songRepo.saveAll(songs)
        album.songs = songs
        return album
    }

//    fun createSong(spotifySong:NewSongInput) : Song
//    {
//        var album:Album? = null
//        var artist:Artist = spotifySong.artist.let { Artist(id = UUID.randomUUID(), name= it.name, vendorId = it.vendorId , thumbnail = it.thumbnail    )   }
//        if (artist.vendorId != null) {
//            val existingArtist  = artistRepo.findByVendorId(artist.vendorId!!)
//            if (existingArtist != null) {
//                artist = existingArtist;
//            } else {
//                artistRepo.save(artist)
//            }
//        }
//        if (spotifySong.album != null) {
//            album = spotifySong.album.let  { Album(id = UUID.randomUUID(), vendorId =  it.vendorId, isComplete=false, name = it.name, year= it.year, artist = artist, thumbnail = it.thumbnail) }
//            if (album.vendorId != null) {
//                val existingAlbum = albumRepo.findByVendorId(album.vendorId!!)
//                if (existingAlbum != null) {
//                    album = existingAlbum
//                } else {
//                    albumRepo.save(album)
//                }
//            }
//        }
//        var song:Song  = spotifySong.let { Song( id =  UUID.randomUUID(),  vendorId = it.vendorId, name = it.name, album = album, artist = artist, score = it.score, number= it.number, discNumber = it.discNumber   ) }
//        songRepo.save(song)
//        return song
//    }
}