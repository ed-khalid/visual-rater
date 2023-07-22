import React, { Dispatch, useEffect, useRef, useState } from "react"
import { Album, Artist, ComparisonSong, Song, useCompareSongToOtherSongsByOtherArtistsLazyQuery, useUpdateSongMutation } from "../../generated/graphql"
import { RatedMusicItemUI } from "../../models/ui/ItemTypes"
import { Rater } from "./Rater"
import { RaterState, RATER_X, RATER_Y_BOTTOM, RATER_Y_TOP, RatedSongItemGrouped, RaterOrientation, SVG_HEIGHT, SVG_WIDTH } from "../../models/ui/RaterTypes"
import { RatedItem } from "../../models/domain/ItemTypes"
import { RaterAction } from "../../reducers/raterReducer"
import { MusicData, MusicFilters, MusicScope, MusicState, MusicStore } from "../../models/domain/MusicState"
import { ComparisonSongs} from "./comparison-rater/ComparisonSongs"

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
    const [comparisonSongs, setComparisonSongs] = useState<ComparisonSong[]>([]) 
    const [songBeingDragged, setSongBeingDragged] = useState<Song|undefined>() 
    const [ $getComparisonSongs, $comparisonSongs ] = useCompareSongToOtherSongsByOtherArtistsLazyQuery() 
    const [updateSong]  = useUpdateSongMutation();
    const [scope, setScope]= useState<MusicScope>(MusicScope.ALL)
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
          const songsAsComparisonSong:ComparisonSong ={ albumName: album.name, thumbnail: album.thumbnail, albumDominantColor: album.dominantColor!, artistName: artist.name, songName: songBeingDragged?.name || 'ERROR NO DRAGGED SONG', songScore: songBeingDragged?.score || 0 }
          setComparisonSongs([...$comparisonSongs.data.compareToOtherSongsByOtherArtists, songsAsComparisonSong]) 
        }
      }
    }, [ $comparisonSongs.loading, $comparisonSongs.data, songBeingDragged, musicState])



    const onSongScoreUpdate = (id:string, score:number) => {
          updateSong({variables: {song:  { id , score} }})
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
      const store = new MusicStore(new MusicData(musicState.data), new MusicFilters(musicState.filters))  
      const items = store.getItems() 
      setScope(store.scope)
       const groupCloseItems = (ratedItems:RatedMusicItemUI[]) => {
            const groupedItems = ratedItems.reduce((acc:RatedSongItemGrouped[] , curr:RatedMusicItemUI) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RatedSongItemGrouped) =>  Math.abs(Number(it.position) - position) < 50  )
                if (overlap) {
                    overlap.items.push(curr)
                    overlap.items.sort((a,b) => (a.score > b.score) ? 1 : (a.score < b.score) ? -1 : 0 )
                    overlap.items.forEach((item, i) => item.tier = ((i+1)))
                } else {
                    acc.push({ position, items:[curr], id: '' + acc.length + 1 })
                }
                return acc
            },  [])
            return groupedItems
        }  
        const leftItems = items.filter( it => it.orientation === RaterOrientation.LEFT)
        const rightItems = items.filter( it => it.orientation === RaterOrientation.RIGHT)
        const leftGroups =  groupCloseItems(leftItems)
        const rightGroups =  groupCloseItems(rightItems)
        const finalItems = unwrapGroups([...leftGroups, ...rightGroups]) 
        setItems(finalItems)
    }, [musicState.data, musicState.filters, state.scaler])


    return <React.Fragment>
      {comparisonSongs && songBeingDragged && <ComparisonSongs songs={comparisonSongs} songBeingDragged={songBeingDragged} />}
      <svg className="rater" ref={svgRef} id="trackRater" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
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
