import React, { Dispatch, useEffect, useRef, useState } from "react"
import { Album, Artist, GetAlbumsDocument, Song, useUpdateSongMutation } from "../../../generated/graphql"
import { CartesianRater } from "./CartesianRater"
import { CartesianRaterState, CARTESIAN_RATER_X, CARTESIAN_RATER_Y_BOTTOM, CARTESIAN_RATER_Y_TOP, CARTESIAN_SVG_HEIGHT, CARTESIAN_SVG_WIDTH, CARTESIAN_CLOSENESS_THRESHOLD, RaterUIItemGrouped, ArtistRaterItems } from "../../../models/RaterTypes"
import { RatedItem, CartesianRaterItem } from "../../../models/ItemTypes"
import { RaterAction } from "../../../reducers/raterReducer"
import { MusicState } from "../../../music/MusicState"
import { MusicStore } from "../../../music/MusicStore"
import { sortByScore } from "../../../functions/sort"
import { ComparisonRaterType } from "./comparison-rater/ComparisonRater"
import { MusicAction } from "../../../music/MusicAction"
import { mapRaterItemToCartesianRaterItem } from "../../../functions/mapper"

interface Props {
    items:ArtistRaterItems[]
    musicState:MusicState
    musicDispatch:Dispatch<MusicAction>
}


export const CartesianRaterWrapper = ({items}:Props) =>  {
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [updateSong]  = useUpdateSongMutation();
    const [songBeingDragged, setSongBeingDragged] = useState<Song|undefined>()
    const [raterItems, setRaterItems] = useState<CartesianRaterItem[]>([])
    const [dragUpdate, setDragUpdate] = useState<{itemId:string,score:number}|undefined>()


    // const loadComparisonSongs = (itemId:string) => {
    //   const song = musicState.data.songs.find(it => it.id === itemId )
    //   if (song) {
    //     setSongBeingDragged(song)
    //   }
    // }    
    const duringDrag =  (itemId:string, score:number) => {
      setDragUpdate({itemId, score})
    } 

    const onSongScoreUpdate = (id:string, score:number) => {
        const artistRaterItem = items.find(item => item.albums.find(it => it.songs.some(it => it.id === id)))
        if (artistRaterItem) {
          updateSong({ variables: {song:  { id , score} }, refetchQueries: [{ query: GetAlbumsDocument, variables: { ids: [album.id] }  }]})
        }
    }  

    const unwrapGroups = (groups:Array<RaterUIItemGrouped>) => {
      const items =  groups.reduce<CartesianRaterItem[]>((acc,curr)=> {
        return [...acc, ...curr.items ]
      }, [])
      const scoreMap = new Map<number, Array<CartesianRaterItem>>()    
      items.forEach(item => {
        let values = scoreMap.get(item.score) || [] 
        values.push(item)
        scoreMap.set(item.score, values)
       })

       for (let [k,v]  of scoreMap) {
        if (v.length !== 1)  {
          v.forEach((item,i,arr) => {
            item.tier = ((i % 7) + 1)
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
      const items = store.getFatSongs().flatMap((it:ArtistRaterItems) => mapRaterItemToCartesianRaterItem(it))
       const groupCloseItems = (ratedItems:CartesianRaterItem[]) => {
            const groupedItems = ratedItems.reduce((acc:RaterUIItemGrouped[] , curr:CartesianRaterItem) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RaterUIItemGrouped) =>  Math.abs(Number(it.position) - position) < CARTESIAN_CLOSENESS_THRESHOLD  )
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
        setRaterItems(finalItems)
    }, [musicState.data, musicState.navigationFilters, state.scaler, musicState])


    return <React.Fragment>
      <svg className="rater" ref={svgRef} id="trackRater" viewBox={`0 0 ${CARTESIAN_SVG_WIDTH} ${CARTESIAN_SVG_HEIGHT}`} preserveAspectRatio="xMinYMid slice" >
        <defs>
              <clipPath id="item-clip-path-right">
                  <rect x={CARTESIAN_RATER_X} y={CARTESIAN_RATER_Y_TOP} width={CARTESIAN_SVG_WIDTH/2} height={CARTESIAN_SVG_HEIGHT} ></rect>
              </clipPath>
        </defs>
            <g key={"rater-wrapper"}  ref={gWrapper} id="wrapper">
            <CartesianRater 
                  stateDispatch={stateDispatch}
                  filterMode={filterMode}
                  handleHover={handleHover}
                  position={{x:CARTESIAN_RATER_X, y:CARTESIAN_RATER_Y_BOTTOM}}
                  onItemClick={handleOnArtistClick}
                  isReadonly={false}
                  duringDrag={duringDrag}
                  onSongDrag={loadComparisonSongs} 
                  updateSongScore={onSongScoreUpdate}
                  state={state}
                  zoomTarget={gWrapper.current}
                  items={raterItems}
            />
            </g>
          </svg>
    </React.Fragment>
    

}
