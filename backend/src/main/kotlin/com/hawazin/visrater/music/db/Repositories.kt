package com.hawazin.visrater.music.db

import org.springframework.data.repository.CrudRepository
import java.util.*


interface ArtistRepository: CrudRepository<Album, UUID>   {
    fun findByName(name:String) : Artist?
    fun findByVendorId(vendorId:String): Artist?
}
