package com.hawazin.visrater.music.db

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
