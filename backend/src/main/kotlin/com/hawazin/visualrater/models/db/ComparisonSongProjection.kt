package com.hawazin.visualrater.models.db

interface ComparisonSongProjection{
    val songName:String
    val songScore:Float
    val albumName:String?
    val artistName:String
    val albumDominantColor:String
    val thumbnail: String?
}


