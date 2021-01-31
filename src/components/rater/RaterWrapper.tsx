import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { OtherRaterView, RATER_BOTTOM, SearchOrDashboardAlbum } from "../../App"
import { Artist, Song } from "../../generated/graphql"
import { RatedItem } from "../../models/RatedItem"
import { SelectionRectangle } from "./behaviors/SelectionRectangle"
import { GlobalRaterState, Rater, RaterMode } from "./Rater"

interface Props {
    searchOrDashboardAlbum:SearchOrDashboardAlbum|undefined
    artists:any[]|null|undefined
    otherRaterView:OtherRaterView
    state:GlobalRaterState
    setState:Dispatch<SetStateAction<GlobalRaterState>>
    dashboardAlbumId:string|undefined
    dashboardArtistId:string|undefined
}
const mapSongToRatedItem  = (song:any) : RatedItem => new RatedItem({ id: song.id, vendorId:song.vendorId, name: song.name },song.score!);

export const RaterWrapper = ({searchOrDashboardAlbum, artists, otherRaterView, state, setState, dashboardAlbumId, dashboardArtistId}:Props) =>  {
    const gWrapper = useRef<SVGGElement>(null)
    const svgRef = useRef<SVGSVGElement>(null) 
    const [otherSongs, setOtherSongs] = useState<RatedItem[]>([]) 
    const [mainRaterItems, setMainRaterItems] = useState<RatedItem[]>([])

    useEffect(() => {
      if (svgRef.current) {
        SelectionRectangle(svgRef.current)
      }
    }, [svgRef])

    useEffect(() => {
    if (artists) {
        const songs:Song[] = artists.reduce((curr:Song[],it) => {
          if (it.albums) {
            it.albums.forEach((album:any) => {
              if (album && album.songs) {
                album.songs.forEach((song:any) => {
                  if (song) {
                    curr.push( { ...song, artist: it as Artist })
                  }
                })
              }
            })
          }
          return curr
        },[])
      if (searchOrDashboardAlbum === SearchOrDashboardAlbum.DASHBOARD && dashboardAlbumId) {
        const album = artists.find(it=> it.albums?.find((it:any) => it?.id === dashboardAlbumId))?.albums!.find((it:any) => it?.id === dashboardAlbumId)  
        const ratedItems:RatedItem[] = album!.songs.filter((it:any) => it.score).map(mapSongToRatedItem)
        setMainRaterItems(ratedItems)
        let _otherSongs:Song[];
        switch(otherRaterView) {
          case OtherRaterView.ARTIST:  
             _otherSongs = songs.filter(song => !ratedItems.find(it => it.id === song.id))
             _otherSongs = _otherSongs.filter(it => it.artist.id === dashboardArtistId)
             break;
          case OtherRaterView.EVERYONE:
             _otherSongs = songs.filter(song => !ratedItems.find(it => it.id === song.id))
             break;
          case OtherRaterView.NONE:
            _otherSongs = [] 
        }
        setOtherSongs(_otherSongs.filter(it => it.score).map(mapSongToRatedItem))
      } else {
          setMainRaterItems([])
           const _otherSongs = songs.filter(it => it.score).map(mapSongToRatedItem)
          setOtherSongs(_otherSongs)
        }
    }
  }, [dashboardAlbumId, artists, otherRaterView])

    return <svg preserveAspectRatio="xMidYMin meet" ref={svgRef} id="trackRater" viewBox="0 0 800 1200">
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
          >
          </Rater>}
          {otherRaterView !== OtherRaterView.NONE &&  
          <Rater
            state = {state}
            setState={setState}
            position={{x:350,y:RATER_BOTTOM}}
            items={otherSongs}
            setItems={setOtherSongs}
            mode={RaterMode.SECONDARY}
          >
          </Rater>
          }
          </g>
        </svg>

}