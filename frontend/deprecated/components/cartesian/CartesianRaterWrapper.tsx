import React, { useEffect, useRef, useState } from "react"
import { GetAlbumsDocument, Song, useUpdateSongMutation } from "../../../src/generated/graphql"
import { CartesianRater } from "./CartesianRater"
import { FatSong } from "../../../src/models/CoreModels"
import { sortByScore } from "../../functions/sort"
import { mapRaterItemToCartesianRaterItem } from "../../../src/functions/mapper"
import { CARTESIAN_RATER_X, CARTESIAN_RATER_Y_TOP, CARTESIAN_SVG_HEIGHT, CARTESIAN_SVG_WIDTH, CartesianRaterItem, CartesianRaterState } from "../../models/CartesianRaterModels"
import { useMusicStateAndDispatch } from "../../../src/hooks/MusicStateHooks"

interface Props {
    items:FatSong[]
    state: CartesianRaterState
}


export const CartesianRaterWrapper = ({items, state}:Props) =>  {

    const { state: musicState, dispatch } = useMusicStateAndDispatch() 
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [updateSong]  = useUpdateSongMutation();
    const [songBeingDragged, setSongBeingDragged] = useState<Song|undefined>()
    const [raterItems, setRaterItems] = useState<CartesianRaterItem[]>([])
    const [dragUpdate, setDragUpdate] = useState<{itemId:string,score:number}|undefined>()


    const loadComparisonSongs = (itemId:string) => {
      const song = musicState.data.songs.find(it => it.id === itemId )
      if (song) {
        setSongBeingDragged(song)
      }
    }    

    const duringDrag =  (itemId:string, score:number) => {
      setDragUpdate({itemId, score})
    } 

    const onSongScoreUpdate = (id:string, score:number) => {
        const item = items.find(item => item.song.id === id)
        if (item) {
          updateSong({ variables: {song:  { id , score} }, refetchQueries: [{ query: GetAlbumsDocument, variables: { ids: [item.song.albumId] }  }]})
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
      const cartesianItems = mapRaterItemToCartesianRaterItem(items).flatMap(it => it)
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
        const groups =  groupCloseItems(cartesianItems)
        const finalItems = unwrapGroups([...groups]) 
        setRaterItems(finalItems)
    }, [musicState.data, musicState.navigationFilters, state.scaler, state])


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
