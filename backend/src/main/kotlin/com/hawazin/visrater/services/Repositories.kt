package com.hawazin.visrater.services

import com.hawazin.visrater.models.db.Album
import com.hawazin.visrater.models.db.Artist
import com.hawazin.visrater.models.db.Song
import org.springframework.data.repository.CrudRepository
import java.util.*


interface ArtistRepository: CrudRepository<Artist, UUID>   {
    fun findByName(name:String) : Artist?
    fun findByVendorId(vendorId:String): Artist?
}

interface AlbumRepository: CrudRepository<Album, UUID> {
    fun findByVendorId(vendorId:String): Album?
}

interface SongRepository:CrudRepository<Song,UUID> {
    fun findByName(name:String) : Song?
   fun findByVendorId(vendorId:String): Song?
}
