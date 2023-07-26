import React, { Dispatch, useEffect, useRef, useState } from "react"
import { Album, Artist, Song, useCompareSongToOtherSongsByOtherArtistsLazyQuery, useUpdateSongMutation } from "../../generated/graphql"
import { ComparisonSongUIItem, RatedMusicItemUI } from "../../models/ui/ItemTypes"
import { Rater } from "./Rater"
import { RaterState, RATER_X, RATER_Y_BOTTOM, RATER_Y_TOP, RatedSongItemGrouped, RaterOrientation, SVG_HEIGHT, SVG_WIDTH, CLOSENESS_THRESHOLD } from "../../models/ui/RaterTypes"
import { RatedItem } from "../../models/domain/ItemTypes"
import { RaterAction } from "../../reducers/raterReducer"
import {  MusicScope, MusicState } from "../../music/MusicState"
import { ComparisonSongs} from "./comparison-rater/ComparisonSongs"
import { mapComparisonSongToComparisonSongUIItem } from "../../functions/mapper"
import { MusicStore } from "../../music/MusicStore"
import { sortByScore } from "../../functions/sort"

interface Props {
    onAlbumClick:(albums:Album) => void 
    onArtistClick:(artist:Artist) => void
    state:RaterState
    musicState:MusicState
    stateDispatch:Dispatch<RaterAction>
}


export const RaterWrapper = ({state, stateDispatch, musicState, onArtistClick, onAlbumClick}:Props) =>  {
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [comparisonSongs, setComparisonSongs] = useState<ComparisonSongUIItem[]>([]) 
    const [songBeingDragged, setSongBeingDragged] = useState<Song|undefined>() 
    const [ $getComparisonSongs, $comparisonSongs ] = useCompareSongToOtherSongsByOtherArtistsLazyQuery() 
    const [updateSong]  = useUpdateSongMutation();
    const [scope, setScope]= useState<MusicScope>(MusicScope.ARTIST)
    const [items, setItems] = useState<RatedMusicItemUI[]>([])


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

    const duringDrag =  (itemId:string, score:number) => {
      setSongBeingDragged(song => ( (song) ? { ...song, score }: undefined))
      const song = comparisonSongs.find(it => it.id === itemId)
      if (song) {
        song.score = score 
        const otherSongs = comparisonSongs.filter(it => it.id !== itemId) 
        setComparisonSongs([song, ...otherSongs])
      }
    } 

    const loadComparisonSongs = (itemId:string) => {
      if (scope !== MusicScope.SONG) return; 
      const song = musicState.data.songs.find(it => it.id === itemId )
      if (song) {
        setSongBeingDragged(song)
        $getComparisonSongs({variables: { artistId: song.artistId, songId: song.id }})
      }
    }    
    useEffect(() => {
      if (!$comparisonSongs.loading && $comparisonSongs.data) {
        const album = musicState.data.albums.find(it => it.id === songBeingDragged?.albumId ) 
        const artist = musicState.data.artists.find(it => it.id === songBeingDragged?.artistId ) 
        if (album && artist) {
          const songsAsComparisonSong:ComparisonSongUIItem ={ id: songBeingDragged!.id,   albumName: album.name, albumThumbnail: album.thumbnail!, overlay: album.dominantColor!, artistName: artist.name, name: songBeingDragged?.name || 'ERROR NO DRAGGED SONG', score: songBeingDragged?.score || 0, isMain: true }
          const otherSongs = $comparisonSongs.data.compareToOtherSongsByOtherArtists.map(it => mapComparisonSongToComparisonSongUIItem(it, false) )
          setComparisonSongs([...otherSongs, songsAsComparisonSong])
        }
      }
    }, [ $comparisonSongs.loading, $comparisonSongs.data, songBeingDragged, musicState])



    const onSongScoreUpdate = (id:string, score:number) => {
          updateSong({variables: {song:  { id , score} }})
          setComparisonSongs([])
          setSongBeingDragged(undefined)
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
      return groups.reduce<RatedMusicItemUI[]>((acc,curr)=> {
        return [...acc, ...curr.items ]
      }, [])
    } 

    useEffect(() => {
      if (!musicState.data.artists.length) {
        return
      }
      const store = new MusicStore(musicState)
      const items = store.getItems() 
      setScope(store.getScope())
       const groupCloseItems = (ratedItems:RatedMusicItemUI[]) => {
            const groupedItems = ratedItems.reduce((acc:RatedSongItemGrouped[] , curr:RatedMusicItemUI) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RatedSongItemGrouped) =>  Math.abs(Number(it.position) - position) < CLOSENESS_THRESHOLD  )
                if (overlap) {
                    overlap.items.push(curr)
                    sortByScore(overlap.items)
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
    }, [musicState.data, musicState.filters, state.scaler])


    return <React.Fragment>
      {comparisonSongs && <ComparisonSongs songs={comparisonSongs} />}
      <svg className="rater" ref={svgRef} id="trackRater" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid slice" >
        <circle cx={0} cy={0} r={25} fill="red"></circle>
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
                  isReadonly={scope !== MusicScope.SONG}
                  onItemClick={(scope === MusicScope.ALBUM) ? handleOnAlbumClick : handleOnArtistClick}
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
