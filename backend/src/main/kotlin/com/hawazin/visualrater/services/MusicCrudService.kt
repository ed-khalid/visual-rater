package com.hawazin.visualrater.services

import com.hawazin.visualrater.models.db.*
import com.hawazin.visualrater.models.graphql.*
import graphql.GraphqlErrorException
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.*


@Service
class MusicCrudService(private val genreRepo: GenreRepository, private val songRepo: SongRepository, private val albumRepo: AlbumRepository, private val artistRepo: ArtistRepository, private val artistPublisherService: PublisherService<Artist>, private val albumPublisherService: PublisherService<Album>) {

    val unratedGenre = genreRepo.findByName("NOT CHOSEN").get()

    fun getAllGenres(): Page<Genre> = genreRepo.findAll(PageRequest.of(0, 50))

    fun getUnratedAlbums(): List<Album> = albumRepo.findUnratedAlbums()


    fun getArtist(params:ArtistSearchParams): Optional<Artist> =
        if (params.id !== null) {
            artistRepo.findById(params.id)
        } else if (!params.name.isNullOrBlank()) {
            artistRepo.findByName(params.name)
        } else {
            throw Error("getArtist: all params are null")
        }


    @Transactional
    fun readArtists() : Page<Artist> = artistRepo.findAll(PageRequest.of(0,50))
    @Transactional
    fun readAlbums(ids:List<UUID>): Iterable<Album> = albumRepo.findAllById(ids)
    @Transactional
    fun readArtistByName(name:String) = artistRepo.findByName(name)
    @Transactional
    fun readArtists(artistIds:List<UUID>) : Iterable<Artist> =  artistIds.map {  artistRepo.findById(it) }.filter { (it.isPresent) }.map { it.get() }
    @Transactional
    fun readSongsForAlbums(albumIds:List<UUID>) : Iterable<Iterable<Song>> = albumIds.map{ songRepo.findByAlbumId(it) }
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
        val artist = artistRepo.findById(song.artistId)
        val album = albumRepo.findById(song.albumId)
        if (artist.isPresent) {
            artistPublisherService.notify(artist.get())
        }
        if (album.isPresent) {
            albumPublisherService.notify(album.get())
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
        song.shortname = songInput.shortname ?: song.shortname
        song.name = songInput.name ?: song.name
        song.number = songInput.number ?: song.number
        song.updatedAt = OffsetDateTime.now()
        songRepo.save(song)
        return song
    }


    @Transactional
    fun createArtist(artistInput: ArtistInput): Artist
    {
        val maybeArtist = artistRepo.findByName(artistInput.name)
        if (!maybeArtist.isPresent) {
            val artist:Artist = artistInput.let { Artist(id = null, vendorId= it.vendorId, name= it.name,thumbnail = it.thumbnail, score  = 0.0, metadata = ArtistMetadata(id = null, tier = 0, songs = ArtistSongMetadata(), totalAlbums = 0, totalSongs = 0 , ), dominantColor =  artistInput.dominantColor, createdAt = OffsetDateTime.now(), updatedAt = null, primaryGenre = unratedGenre, secondaryGenres = mutableListOf()   )   }
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
        val album = albumInput.let  { Album(id = UUID.randomUUID(),name = it.name, vendorId=it.vendorId,  year= it.year, artistId = artist.id!!, thumbnail = it.thumbnail, score = 0.0, dominantColor = it.dominantColor, songs = null, createdAt = OffsetDateTime.now(), updatedAt = null, primaryGenre = unratedGenre, secondaryGenres = mutableListOf()  ) }
        albumRepo.save(album)
        val songs = albumInput.songs.map { Song( id =  UUID.randomUUID(), name = it.name, albumId = album.id, artistId = artist.id!!, score = it.score, number= it.number, discNumber = it.discNumber, createdAt = OffsetDateTime.now(), updatedAt = null, primaryGenre = unratedGenre, secondaryGenres = mutableListOf()  ) }
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