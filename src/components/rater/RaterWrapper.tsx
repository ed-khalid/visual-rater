import React, { Dispatch, useEffect, useRef, useState } from "react"
import { Album, Artist, GetAlbumsDocument, Song, useUpdateSongMutation } from "../../generated/graphql"
import { Rater } from "./Rater"
import { RaterState, RATER_X, RATER_Y_BOTTOM, RATER_Y_TOP, SVG_HEIGHT, SVG_WIDTH, CLOSENESS_THRESHOLD, RaterUIItemGrouped } from "../../models/RaterTypes"
import { RatedItem, RaterUIItem } from "../../models/ItemTypes"
import { RaterAction } from "../../reducers/raterReducer"
import { MusicZoomLevel, MusicState } from "../../music/MusicState"
import { MusicStore } from "../../music/MusicStore"
import { sortByScore } from "../../functions/sort"
import { ComparisonRaterType } from "./comparison-rater/ComparisonRater"
import { MusicAction } from "../../music/MusicAction"

interface Props {
    onAlbumClick:(albums:Album) => void 
    onArtistClick:(artist:Artist) => void
    filterMode:boolean
    itemsToFilter:string[]
    state:RaterState
    musicState:MusicState
    musicDispatch:Dispatch<MusicAction>
    comparisonRaterOptions:Map<ComparisonRaterType,boolean>|undefined
    stateDispatch:Dispatch<RaterAction>
    handleHover:(item:RaterUIItem, on:boolean) => void
}


export const RaterWrapper = ({state, stateDispatch, handleHover, comparisonRaterOptions,filterMode, itemsToFilter, musicDispatch, musicState, onArtistClick, onAlbumClick}:Props) =>  {
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
        const store = new MusicStore(musicState) 
        const song = store.findSongById(id)
        if (song) {
          updateSong({ variables: {song:  { id , score} }, refetchQueries: [{ query: GetAlbumsDocument, variables: { ids: [song.albumId] }  }]})
        }
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


    const unwrapGroups = (groups:Array<RaterUIItemGrouped>) => {
      const items =  groups.reduce<RaterUIItem[]>((acc,curr)=> {
        return [...acc, ...curr.items ]
      }, [])
      const scoreMap = new Map<number, Array<RaterUIItem>>()    
      items.forEach(item => {
        let values = scoreMap.get(item.score) || [] 
        values.push(item)
        scoreMap.set(item.score, values)
       })

       for (let [k,v]  of scoreMap) {
        if (v.length !== 1)  {
          v.sort((a,b) =>  (a.tier < b.tier)? -1 : (a.tier > b.tier) ? 1 : 0 )
          v.forEach((item,i,arr) => {
            if (i !== arr.length-1) {
              item.shouldDrawLine = false
            }
          })
        }
       }


      return items
    } 

    useEffect(() => {
      if (!musicState.data.artists.length) {
        return
      }
      const store = new MusicStore(musicState)
      const items = store.getRaterItems()
       const groupCloseItems = (ratedItems:RaterUIItem[]) => {
            const groupedItems = ratedItems.reduce((acc:RaterUIItemGrouped[] , curr:RaterUIItem) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RaterUIItemGrouped) =>  Math.abs(Number(it.position) - position) < CLOSENESS_THRESHOLD  )
                if (overlap) {
                    overlap.items.push(curr)
                    sortByScore(overlap.items)
                    const sum = overlap.items.reduce<number>((acc,curr) => state.scaler.toPosition(curr.score) + acc, 0)    
                    overlap.position = sum/overlap.items.length 
                    overlap.items.forEach((item, i, arr) =>  { 
                      item.tier = ((i % 15) + 1)
                    })
                    
                } else {
                    acc.push({ position, items:[curr], id: '' + acc.length + 1 })
                }
                return acc
            },  [])
            return groupedItems
        }  
        const groups =  groupCloseItems(items)
        const finalItems = unwrapGroups([...groups]) 
        setItems(finalItems)
    }, [musicState.data, musicState.filters, state.scaler, musicState])


    return <React.Fragment>
      <svg className="rater" ref={svgRef} id="trackRater" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMinYMid slice" >
        <defs>
              <clipPath id="item-clip-path-right">
                  <rect x={RATER_X} y={RATER_Y_TOP} width={SVG_WIDTH/2} height={SVG_HEIGHT} ></rect>
              </clipPath>
        </defs>
            <g key={"rater-wrapper"}  ref={gWrapper} id="wrapper">
            <Rater 
                  itemsToFilter={itemsToFilter}
                  stateDispatch={stateDispatch}
                  filterMode={filterMode}
                  handleHover={handleHover}
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
