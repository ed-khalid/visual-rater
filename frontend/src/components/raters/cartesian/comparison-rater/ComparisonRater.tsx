import { Dispatch, useEffect, useState } from "react"
import { Song, useCompareSongToOtherSongsByOtherArtistsLazyQuery, useCompareSongToOthersSameArtistLazyQuery } from "../../../../generated/graphql"
import { ComparisonSongUIItem } from "../../../../models/ItemTypes"
import React from "react"
import { MusicState } from "../../../../music/MusicState"
import { mapComparisonSongToComparisonSongUIItem } from "../../../../functions/mapper"
import { ComparisonSongs } from "./ComparisonSongs"
import { MusicAction } from "../../../../music/MusicAction"

interface Props {
    musicState:MusicState
    musicDispatch:Dispatch<MusicAction>
    songBeingDragged:Song|undefined
    dragUpdate:{itemId:string, score:number}|undefined
    comparisonRaterOptions:Map<ComparisonRaterType,boolean> 
}

export enum ComparisonRaterType  {
    SAME_ARTIST,OTHER_ARTISTS,WHATS_ON_RATER 
}


export const ComparisonRater = ({ songBeingDragged, dragUpdate, musicState, musicDispatch, comparisonRaterOptions}:Props) => {

    const [$getOtherArtistsComparisonSongs, $otherArtistsComparisonSongs ] = useCompareSongToOtherSongsByOtherArtistsLazyQuery() 
    const [$getArtistComparisonSongs, $artistComparisonSongs ] = useCompareSongToOthersSameArtistLazyQuery() 

    const [otherArtistsComparisonSongs, setOtherArtistsComparisonSongs] = useState<ComparisonSongUIItem[]>([]) 
    const [artistComparisonSongs, setArtistComparisonSongs] = useState<ComparisonSongUIItem[]>([]) 


    useEffect(() => {
        if (songBeingDragged) {
          if (comparisonRaterOptions.get(ComparisonRaterType.OTHER_ARTISTS)) {
             $getOtherArtistsComparisonSongs({variables: { artistId: songBeingDragged.artistId, songId: songBeingDragged.id }})
          } 
          if (comparisonRaterOptions.get(ComparisonRaterType.SAME_ARTIST)) {
             $getArtistComparisonSongs({variables: { artistId: songBeingDragged.artistId, songId: songBeingDragged.id, albumId: songBeingDragged.albumId }})
          } 
        }
    } , [songBeingDragged, $getOtherArtistsComparisonSongs, $getArtistComparisonSongs, comparisonRaterOptions] )

    useEffect(() => {
        if (dragUpdate) {
          if (comparisonRaterOptions.get(ComparisonRaterType.OTHER_ARTISTS)) {
                const song = otherArtistsComparisonSongs.find(it => it.id === dragUpdate.itemId)
                if (song) {
                    song.score = dragUpdate.score 
                    const otherSongs = otherArtistsComparisonSongs.filter(it => it.id !== dragUpdate.itemId) 
                    setOtherArtistsComparisonSongs([song, ...otherSongs])
                }
            }
          if (comparisonRaterOptions.get(ComparisonRaterType.SAME_ARTIST)) {
                const song = artistComparisonSongs.find(it => it.id === dragUpdate.itemId)
                if (song) {
                    song.score = dragUpdate.score 
                    const otherSongs = artistComparisonSongs.filter(it => it.id !== dragUpdate.itemId) 
                    setArtistComparisonSongs([song, ...otherSongs])
                }
            }
          }
    }, [dragUpdate, comparisonRaterOptions])

    useEffect(() => {
      if (!$artistComparisonSongs.loading && $artistComparisonSongs.data) {
        const album = musicState.data.albums.find(it => it.id === songBeingDragged?.albumId ) 
        const artist = musicState.data.artists.find(it => it.id === songBeingDragged?.artistId ) 
        if (album && artist) {
          const songsAsComparisonSong:ComparisonSongUIItem ={ id: songBeingDragged!.id, albumId:"", artistId: "", albumName: album.name, thumbnail: album.thumbnail!, overlay: album.dominantColor!, artistName: artist.name, name: songBeingDragged?.name || 'ERROR NO DRAGGED SONG', score: songBeingDragged?.score || 0, isMain: true }
          const otherSongs = $artistComparisonSongs.data.compareToOtherSongsBySameArtist.map(it => mapComparisonSongToComparisonSongUIItem(it, false) )
          setArtistComparisonSongs([...otherSongs, songsAsComparisonSong])
        }
      }
    }, [$artistComparisonSongs.loading, $artistComparisonSongs.data, songBeingDragged, musicState])

    useEffect(() => {
      if (!$otherArtistsComparisonSongs.loading && $otherArtistsComparisonSongs.data) {
        const album = musicState.data.albums.find(it => it.id === songBeingDragged?.albumId ) 
        const artist = musicState.data.artists.find(it => it.id === songBeingDragged?.artistId ) 
        if (album && artist) {
          const songsAsComparisonSong:ComparisonSongUIItem ={ id: songBeingDragged!.id, albumId:"", artistId: "", albumName: album.name, thumbnail: album.thumbnail!, overlay: album.dominantColor!, artistName: artist.name, name: songBeingDragged?.name || 'ERROR NO DRAGGED SONG', score: songBeingDragged?.score || 0, isMain: true }
          const otherSongs = $otherArtistsComparisonSongs.data.compareToOtherSongsByOtherArtists.map(it => mapComparisonSongToComparisonSongUIItem(it, false) )
          setOtherArtistsComparisonSongs([...otherSongs, songsAsComparisonSong])
        }
      }
    }, [ $otherArtistsComparisonSongs.loading, $otherArtistsComparisonSongs.data, songBeingDragged, musicState])


    return <div id="comparison-rater">
        { comparisonRaterOptions.get(ComparisonRaterType.SAME_ARTIST) && 
          <svg className="comparison-songs-box"> 
             <ComparisonSongs songs={artistComparisonSongs} /> 
           </svg>
        } 
        { comparisonRaterOptions.get(ComparisonRaterType.OTHER_ARTISTS) && 
          <svg className="comparison-songs-box"> 
             <ComparisonSongs songs={otherArtistsComparisonSongs} /> 
           </svg>
        } 
    </div>
} 