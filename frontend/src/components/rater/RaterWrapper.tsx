import React, { Dispatch, useEffect, useRef, useState } from "react"
import { Album, Artist, Song, useUpdateSongMutation } from "../../generated/graphql"
import { Rater } from "./Rater"
import { RaterState, RATER_X, RATER_Y_BOTTOM, RATER_Y_TOP, RatedSongItemGrouped, RaterOrientation, SVG_HEIGHT, SVG_WIDTH, CLOSENESS_THRESHOLD } from "../../models/ui/RaterTypes"
import { RatedItem, RaterUIItem } from "../../models/domain/ItemTypes"
import { RaterAction } from "../../reducers/raterReducer"
import {  MusicZoomLevel, MusicState } from "../../music/MusicState"
import { MusicStore } from "../../music/MusicStore"
import { sortByScore } from "../../functions/sort"
import { ComparisonRater, ComparisonRaterType } from "./comparison-rater/ComparisonRater"
import { MusicAction } from "../../music/MusicAction"

interface Props {
    onAlbumClick:(albums:Album) => void 
    onArtistClick:(artist:Artist) => void
    state:RaterState
    musicState:MusicState
    musicDispatch:Dispatch<MusicAction>
    comparisonRaterOptions:Map<ComparisonRaterType,boolean>|undefined
    stateDispatch:Dispatch<RaterAction>
}


export const RaterWrapper = ({state, stateDispatch, comparisonRaterOptions, musicDispatch, musicState, onArtistClick, onAlbumClick}:Props) =>  {
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [updateSong]  = useUpdateSongMutation();
    const [songBeingDragged, setSongBeingDragged] = useState<Song|undefined>()
    const [items, setItems] = useState<RaterUIItem[]>([])
    const [dragUpdate, setDragUpdate] = useState<{itemId:string,score:number}|undefined>()


    // const mouseLocationListener =  (svg:SVGSVGElement) => {
    //     const pt = svg.createSVGPoint() 

    //     const cursorPoint = (evt:MouseEvent) => {
    //       pt.x = evt.clientX
    //       pt.y = evt.clientY
    //       return pt.matrixTransform(svgRef.current?.getScreenCTM()?.inverse())
    //     }

    //     svg.addEventListener('mousemove', (evt) => {
    //       const loc = cursorPoint(evt)
    //       console.log(`{ x: ${loc.x}, y: ${loc.y}`)
    //     })
    // } 

    const loadComparisonSongs = (itemId:string) => {
      if (musicState.zoomLevel !== MusicZoomLevel.SONG) return; 
      const song = musicState.data.songs.find(it => it.id === itemId )
      if (song) {
        setSongBeingDragged(song)
      }
    }    
    const duringDrag =  (itemId:string, score:number) => {
      setDragUpdate({itemId, score})
    } 

    const onSongScoreUpdate = (id:string, score:number) => {
        updateSong({ variables: {song:  { id , score} }})
    }  

    const handleOnAlbumClick =  (item:RatedItem) => {
      const album = musicState.data.albums.find(it => it.id === item.id )
      if (album) {
        onAlbumClick(album)
      } else {
        console.log('couldnt find album in music state ')
      }
    }
    const handleOnArtistClick =  (item:RatedItem) => {
      const artist = musicState.data.artists.find(it => it.id === item.id) 
      if (artist) {
        onArtistClick(artist)
      }
    }


    const unwrapGroups = (groups:Array<RatedSongItemGrouped>) => {
      return groups.reduce<RaterUIItem[]>((acc,curr)=> {
        return [...acc, ...curr.items ]
      }, [])
    } 

    useEffect(() => {
      if (!musicState.data.artists.length) {
        return
      }
      const store = new MusicStore(musicState)
      const items = store.getRaterItems()
       const groupCloseItems = (ratedItems:RaterUIItem[]) => {
            const groupedItems = ratedItems.reduce((acc:RatedSongItemGrouped[] , curr:RaterUIItem) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RatedSongItemGrouped) =>  Math.abs(Number(it.position) - position) < CLOSENESS_THRESHOLD  )
                if (overlap) {
                    overlap.items.push(curr)
                    sortByScore(overlap.items)
                    const sum = overlap.items.reduce<number>((acc,curr) => state.scaler.toPosition(curr.score) + acc, 0)    
                    overlap.position = sum/overlap.items.length 
                    overlap.items.forEach((item, i) => item.tier = ((i+1)))
                } else {
                    acc.push({ position, items:[curr], id: '' + acc.length + 1 })
                }
                return acc
            },  [])
            return groupedItems
        }  
        const leftItems = items.filter(it => it.orientation === RaterOrientation.LEFT)
        const rightItems = items.filter(it => it.orientation === RaterOrientation.RIGHT)
        const leftGroups =  groupCloseItems(leftItems)
        const rightGroups =  groupCloseItems(rightItems)
        const finalItems = unwrapGroups([...leftGroups, ...rightGroups]) 
        setItems(finalItems)
    }, [musicState.data, musicState.filters, state.scaler, musicState])


    return <React.Fragment>
      { musicState.zoomLevel === MusicZoomLevel.SONG && songBeingDragged && comparisonRaterOptions && <ComparisonRater  musicDispatch={musicDispatch} songBeingDragged={songBeingDragged} musicState={musicState} dragUpdate={dragUpdate} comparisonRaterOptions={comparisonRaterOptions} />}
      <svg className="rater" ref={svgRef} id="trackRater" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid slice" >
        <defs>
              <clipPath id="item-clip-path-left">
                  <rect x={0} y={0} width={SVG_WIDTH/2} height={SVG_HEIGHT} ></rect>
              </clipPath>
              <clipPath id="item-clip-path-right">
                  <rect x={RATER_X} y={RATER_Y_TOP} width={SVG_WIDTH/2} height={SVG_HEIGHT} ></rect>
              </clipPath>
        </defs>
            <g key={"rater-wrapper"}  ref={gWrapper} id="wrapper">
            <Rater 
                  stateDispatch={stateDispatch}
                  position={{x:RATER_X, y:RATER_Y_BOTTOM}}
                  isReadonly={musicState.zoomLevel !== MusicZoomLevel.SONG}
                  onItemClick={(musicState.zoomLevel === MusicZoomLevel.ALBUM) ? handleOnAlbumClick : handleOnArtistClick}
                  duringDrag={duringDrag}
                  onSongDrag={loadComparisonSongs} 
                  updateSongScore={onSongScoreUpdate}
                  state={state}
                  zoomTarget={gWrapper.current}
                  items={items}
            />
            </g>
          </svg>
    </React.Fragment>
    

}
