package com.hawazin.visualrater.models.db

interface ComparisonSongProjection{
    val id:String
    val songName:String
    val songScore:Float
    val albumName:String?
    val artistName:String
    val albumDominantColor:String
    val thumbnail: String?
}


