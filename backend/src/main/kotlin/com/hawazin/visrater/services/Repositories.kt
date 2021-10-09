package com.hawazin.visrater.services

import com.hawazin.visrater.models.db.*
import org.springframework.data.repository.CrudRepository
import java.util.*


interface ArtistRepository: CrudRepository<Artist, UUID>   {
    fun findByName(name:String) : Artist?
    fun findByVendorId(vendorId:String): Artist?
}

interface ArtistTierRepository: CrudRepository<ArtistTier, UUID> {
    fun findByValue(value: ArtistTierEnum) : ArtistTier
}

interface AlbumRepository: CrudRepository<Album, UUID> {
    fun findByVendorId(vendorId:String): Album?
    fun findByArtistId(artistId: UUID?) : List<Album>
}

interface SongRepository:CrudRepository<Song,UUID> {
    fun findByName(name:String) : Song?
   fun findByVendorId(vendorId:String): Song?
}
