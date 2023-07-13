import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { Album, Artist, Song } from "../../generated/graphql"
import { RatedMusicItemUI, RatedSongItemUI } from "../../models/ui/ItemTypes"
import { Rater } from "./Rater"
import { GlobalRaterState, RATER_X, RATER_Y_BOTTOM, RaterOrientation } from "../../models/ui/RaterTypes"
import { RatedItem } from "../../models/domain/ItemTypes"
import { findAlbumAndArtist, findItemsByIds } from "../../functions/music"

export enum RaterWrapperMode {
  ARTIST,ALBUM,SONG
} 


interface Props {
    artists:Artist[]|undefined
    onAlbumClick:(albums:Array<Album>|undefined, artist:Artist|undefined) => void 
    onArtistClick:(artist:Artist|undefined) => void
    state:GlobalRaterState
    setState:Dispatch<SetStateAction<GlobalRaterState>>
}
const mapSongToRatedItem  = (song:any, artist:Artist, album:Album, orientation:RaterOrientation) : RatedSongItemUI => new RatedSongItemUI({ id: song.id, name: song.name },song.score!, album.thumbnail!, orientation,1, album.dominantColor,song.number,artist.name, album.name);
const mapAlbumToRatedItem  = (album:Album, artist:Artist, orientation:RaterOrientation) : RatedMusicItemUI => new RatedMusicItemUI({ id: album.id, name:album.name}, album.score!, album.thumbnail!, orientation, 1, album.dominantColor)    
const mapArtistToRatedItem  = (artist:Artist, orientation:RaterOrientation) : RatedMusicItemUI => new RatedMusicItemUI({ id: artist.id, name:artist.name}, artist.score!, artist.thumbnail!, orientation, 1, '(0,0,0)')    

export const RaterWrapper = ({state, setState, artists, onArtistClick, onAlbumClick}:Props) =>  {
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [mainRaterItems, setMainRaterItems] = useState<RatedMusicItemUI[]>([])

    const mouseLocationListener =  (svg:SVGSVGElement) => {
        const pt = svg.createSVGPoint() 

        const cursorPoint = (evt:MouseEvent) => {
          pt.x = evt.clientX
          pt.y = evt.clientY
          return pt.matrixTransform(svgRef.current?.getScreenCTM()?.inverse())
        }

        svg.addEventListener('mousemove', (evt) => {
          const loc = cursorPoint(evt)
          console.log(`{ x: ${loc.x}, y: ${loc.y}`)
        })

    } 

    const switchOrientation = (orientation:RaterOrientation) => {
      return orientation === RaterOrientation.LEFT ? RaterOrientation.RIGHT : RaterOrientation.LEFT  
    }

    const handleOnAlbumClick =  (item:RatedItem) => {
      const [album,artist] = findAlbumAndArtist(item.id, artists)  
      if (album) {
        onAlbumClick([album], artist)
      } else {
        onAlbumClick(undefined, artist)
      }
    }
    const handleOnArtistClick =  (item:RatedItem) => {
      const artist = artists!.find(it => it.id === item.id) 
      onArtistClick(artist)
    }


    useEffect(() => {
      if (artists && state.selections) {
        let whichOrientation = RaterOrientation.LEFT  

        if (state.mode === RaterWrapperMode.ARTIST) {
          const selectedArtists = findItemsByIds(state.selections, state.mode, artists) as Array<Artist>  
          const newItems = selectedArtists.map( it => {
            whichOrientation = switchOrientation(whichOrientation)
            return mapArtistToRatedItem(it, whichOrientation)
          })
          setState(prev =>  ({...prev, isReadonly: true}))
          setMainRaterItems(newItems)
        }

        if (state.mode === RaterWrapperMode.ALBUM) {
          let  newItems:Array<RatedMusicItemUI> = []  
          const albums = findItemsByIds(state.selections, state.mode, artists) as Array<{album:Album, artist:Artist}>
          const albumItems = albums.filter(it => it!.album.score! >= state.scoreFilter.start && it!.album.score! <= state.scoreFilter.end )
                 .map(it =>{ 
                whichOrientation = switchOrientation(whichOrientation)
                return mapAlbumToRatedItem(it.album, it.artist,whichOrientation )
            })  
              newItems = [ ...newItems, ...albumItems ] 
          setState(prev => ({ ...prev, isReadonly: true }))
          setMainRaterItems(newItems)
        }  
        if (state.mode === RaterWrapperMode.SONG) {
          const songs = findItemsByIds(state.selections, state.mode, artists) as Array<{song:Song, album:Album, artist:Artist}> 
          const songItems = songs
                .filter(it => it.song.score && (it!.song.score! >= state.scoreFilter.start && it!.song.score! <= state.scoreFilter.end ))
                .map(it =>  {
                  const retv = mapSongToRatedItem(it.song, it.artist, it.album, whichOrientation)
                  whichOrientation = switchOrientation(whichOrientation) 
                  return retv
                })
            setState(prev => ({ ...prev, isReadonly: false }))
            setMainRaterItems(songItems)
              }
            }
    }, [artists, state.selections, state.mode, setState, state.scoreFilter.start, state.scoreFilter.end])


    return <svg className="rater" ref={svgRef} id="trackRater" viewBox="0 0 800 700">
          <defs>
            <clipPath id="clip-path">
              <rect x="0" y="0" width="950" height={950}></rect>
            </clipPath>
          </defs>
          <g ref={gWrapper} id="wrapper">
          {mainRaterItems.length && <Rater 
                setState={setState}
                position={{x:RATER_X, y:RATER_Y_BOTTOM}}
                isReadonly={state.mode !== RaterWrapperMode.SONG}
                onItemClick={(state.mode === RaterWrapperMode.ALBUM) ? handleOnAlbumClick : handleOnArtistClick}
                state={state}
                zoomTarget={gWrapper.current}
                items={mainRaterItems}
                setItems={setMainRaterItems}
          />
          }
          </g>
        </svg>

}