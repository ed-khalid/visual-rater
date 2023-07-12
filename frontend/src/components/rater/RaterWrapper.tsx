import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { Album, Artist } from "../../generated/graphql"
import { RatedMusicItemUI, RatedSongItemUI } from "../../models/ui/ItemTypes"
import { Rater } from "./Rater"
import { GlobalRaterState, RATER_X, RATER_Y_BOTTOM, RaterOrientation } from "../../models/ui/RaterTypes"
import { RatedItem } from "../../models/domain/ItemTypes"

export enum RaterWrapperMode {
  ARTIST,ALBUM
} 


interface Props {
    artists:Artist[]|undefined
    items:Array<Artist>|Array<Album>
    mode:RaterWrapperMode
    onAlbumClick:(album:Album|undefined, artist:Artist|undefined) => void 
    state:GlobalRaterState
    setState:Dispatch<SetStateAction<GlobalRaterState>>
}
const mapSongToRatedItem  = (song:any, artist:Artist, album:Album, orientation:RaterOrientation) : RatedSongItemUI => new RatedSongItemUI({ id: song.id, name: song.name },song.score!, album.thumbnail!, orientation,1, album.dominantColor,song.number,artist.name, album.name);
const mapAlbumToRatedItem  = (album:Album, artist:Artist, orientation:RaterOrientation) : RatedMusicItemUI => new RatedMusicItemUI({ id: album.id, name:album.name}, album.score!, album.thumbnail!, orientation, 1, album.dominantColor)    

export const RaterWrapper = ({state, setState, artists, onAlbumClick, items, mode}:Props) =>  {
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

    const findAlbumAndArtist = (albumId:string) : [Album|undefined, Artist|undefined] => {
      let retv:[Album|undefined, Artist|undefined]= [undefined,undefined]; 
      if (artists) {
            artists.find(artist => {
              const foundAlbum = artist.albums?.find(album => album?.id === albumId)
              if (foundAlbum) {
                retv = [foundAlbum, artist] 
                return true
              }
              else {
                return false
              }
            })
       }
      return retv
    }

    const handleOnAlbumClick =  (item:RatedItem) => {
      const [album,artist] = findAlbumAndArtist(item.id)  
      onAlbumClick(album, artist)
    }

    useEffect(() => {
      if (artists) {
        let whichOrientation = RaterOrientation.LEFT  

        if (mode === RaterWrapperMode.ARTIST) {
          let  newItems:Array<RatedMusicItemUI> = []  
          const artists = items as Array<Artist>   
          artists.map(it => it.id).forEach(artistId => {
            const foundArtist = artists.find(artist => artist.id === artistId)
            if (foundArtist) {
              const albumItems = foundArtist.albums!.map(it =>{ 
                whichOrientation = switchOrientation(whichOrientation)
                return mapAlbumToRatedItem(it!, foundArtist,whichOrientation )
            })  
              newItems = [ ...newItems, ...albumItems ] 
            }
          })
          setState(prev => ({ ...prev, isReadonly: true }))
          setMainRaterItems(newItems)
        }  
        if (mode === RaterWrapperMode.ALBUM) {
          let raterAlbums : Array<RatedSongItemUI>  = []
          const albums = items as Array<Album> 
          albums.map(it => it.id).forEach(albumId => {
            artists.find(artist => {
              const foundAlbum = artist.albums?.find(album => album?.id === albumId)
              if (foundAlbum && foundAlbum.songs) {
                const albumItems = foundAlbum.songs.filter(it => it.score).map(it => mapSongToRatedItem(it, artist, foundAlbum, whichOrientation)) 
                raterAlbums = [...raterAlbums, ...albumItems] 
                whichOrientation = switchOrientation(whichOrientation) 
                return true;
              }
              return false;
            })
            setState(prev => ({ ...prev, isReadonly: false }))
            setMainRaterItems(raterAlbums)
          })
        }
      }
    }, [artists, items, mode, setState])


    return <svg preserveAspectRatio="xMidYMin meet" ref={svgRef} id="trackRater" viewBox="0 0 800 700">
          <defs>
            <clipPath id="clip-path">
              <rect x="0" y="0" width="950" height={950}></rect>
            </clipPath>
          </defs>
          <g ref={gWrapper} id="wrapper">
          {mainRaterItems.length && <Rater 
                setState={setState}
                position={{x:RATER_X, y:RATER_Y_BOTTOM}}
                isReadonly={mode === RaterWrapperMode.ARTIST}
                onItemClick={handleOnAlbumClick}
                state={state}
                zoomTarget={gWrapper.current}
                items={mainRaterItems}
                setItems={setMainRaterItems}
          />
          }
          </g>
        </svg>

}