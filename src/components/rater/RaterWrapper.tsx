import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { RATER_BOTTOM } from "../../App"
import { Album, Artist } from "../../generated/graphql"
import { RatedSongItemUI } from "../../models/ui/ItemTypes"
import { GlobalRaterState, Rater, RaterOrientation } from "./Rater"



interface Props {
    artists:Artist[]|undefined
    albums:Array<Album>
    state:GlobalRaterState
    setState:Dispatch<SetStateAction<GlobalRaterState>>
}
const mapSongToRatedItem  = (song:any, artist:Artist, album:Album, orientation:RaterOrientation) : RatedSongItemUI => new RatedSongItemUI({ id: song.id, name: song.name },song.score!, album.thumbnail!, song.number,artist.name, album.name, orientation, 1 );

export const RaterWrapper = ({state, setState, artists, albums}:Props) =>  {
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [mainRaterItems, setMainRaterItems] = useState<RatedSongItemUI[]>([])

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

    useEffect(() => {
      if (artists) {
        let whichOrientation = RaterOrientation.LEFT  
        let raterAlbums : Array<RatedSongItemUI>  = []

        albums.map(it => it.id).forEach(albumId => {
          artists.find(artist => {
            const foundAlbum = artist.albums?.find(album => album?.id === albumId)
            if (foundAlbum && foundAlbum.songs) {
               const albumItems = foundAlbum.songs.filter(it => it.score).map(it => mapSongToRatedItem(it, artist, foundAlbum, whichOrientation)) 
               raterAlbums = [...raterAlbums, ...albumItems] 
               whichOrientation = (whichOrientation === RaterOrientation.LEFT) ? RaterOrientation.RIGHT : RaterOrientation.LEFT   
               return true;
            }
            return false;
          })
          setMainRaterItems(raterAlbums)
        })
      }
    }, [artists, albums])


    return <svg preserveAspectRatio="xMidYMin meet" ref={svgRef} id="trackRater" viewBox="0 0 600 620">
          <defs>
            <clipPath id="clip-path">
              <rect x="0" y="0" width="950" height={950}></rect>
            </clipPath>
          </defs>
          <g ref={gWrapper} id="wrapper">
          {mainRaterItems.length && <Rater 
                setState={setState}
                position={{x:350, y:RATER_BOTTOM}}
                state={state}
                zoomTarget={gWrapper.current}
                items={mainRaterItems}
                setItems={setMainRaterItems}
          />
          }
          </g>
        </svg>

}