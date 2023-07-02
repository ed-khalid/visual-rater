import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { RATER_BOTTOM } from "../../App"
import { Album, Artist } from "../../generated/graphql"
import { RatedItem, RatedSongItem } from "../../models/RatedItem"
import { GlobalRaterState, Rater, RaterMode } from "./Rater"

interface Props {
    artists:Artist[]|undefined
    selectedAlbumId:string|undefined
    selectedArtistId:string|undefined
    state:GlobalRaterState
    setState:Dispatch<SetStateAction<GlobalRaterState>>
}
const mapSongToRatedItem  = (song:any, artist:Artist, album:Album) : RatedSongItem => new RatedSongItem({ id: song.id, name: song.name },song.score!, album.thumbnail!, song.number,artist.name, album.name );

export const RaterWrapper = ({state, setState, artists, selectedAlbumId, selectedArtistId}:Props) =>  {
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [mainRaterItems, setMainRaterItems] = useState<RatedSongItem[]>([])

    useEffect(() => {
      if (artists) {
        const artist = artists.find(it => it.id === selectedArtistId)
        if (artist) {
        const album = artists.find(it => it.id === selectedArtistId)?.albums?.find(it => it?.id === selectedAlbumId) 
        if (album && album.songs) {
          setMainRaterItems(album.songs.filter(it => it.score).map(it => mapSongToRatedItem(it, artist,album)))
        }
        }
      }
    }, [artists, selectedAlbumId, selectedArtistId])


    return <svg preserveAspectRatio="xMidYMin meet" ref={svgRef} id="trackRater" viewBox="0 0 800 300">
          <defs>
            <clipPath id="clip-path">
              <rect x="0" y="0" width="950" height={950}></rect>
            </clipPath>
          </defs>
          <g ref={gWrapper} id="wrapper">
          {mainRaterItems.length && <Rater 
                setState={setState}
                position={{x:300, y:RATER_BOTTOM}}
                state={state}
                zoomTarget={gWrapper.current}
                items={mainRaterItems}
                setItems={setMainRaterItems}
                mode={RaterMode.PRIMARY}
          />
          }
          </g>
        </svg>

}