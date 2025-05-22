import { useEffect, useState } from "react"
import { MusicNavigatorPanel } from "../components/panels/navigator/main-navigator/MusicNavigatorPanel"
import { Album, Artist, Song, useGetAlbumsSongsLazyQuery, useGetArtistFullLazyQuery, useGetArtistsPageQuery } from "../generated/graphql"
import { useMusicDispatch, useMusicStateOperator } from "../hooks/MusicStateHooks"
import { AddSection } from "../components/newalbum/AddSection"
import { RaterEntityRequest } from "../models/RaterTypes"
import { FilterMode } from "../music/MusicFilters"
import { RaterStyle } from "../App"
import { GridRater } from "../components/raters/grid/GridRater"
import { BlockRater } from "../components/raters/block/BlockRater"


interface Props {
    raterStyle: RaterStyle

}
export const HomePage = ({raterStyle}:Props) => {


  const musicDispatch = useMusicDispatch()
  const musicStateOperator = useMusicStateOperator()
  const $artistsPage  =  useGetArtistsPageQuery()

  const [$loadArtistFull, $artistFull] = useGetArtistFullLazyQuery()
  const [$loadSongsForAlbum, $songsForAlbum] = useGetAlbumsSongsLazyQuery()

  // used on initial page load to load artists into musicState
  useEffect(() => {
  if (!$artistsPage.loading && $artistsPage.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: $artistsPage.data.artists.content as Artist[]   }})
  }
  }, [$artistsPage.loading, $artistsPage.data, musicDispatch])

  useEffect(() => {
    if (!$artistFull.loading && $artistFull.data) {
      const songs = $artistFull.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistFull.data.artist] as Artist[], albums: $artistFull.data.artist?.albums as Album[], songs     }})
    }
  }, [$artistFull.loading, $artistFull.data, musicDispatch])

  useEffect(() => {
    if (!$songsForAlbum.loading && $songsForAlbum.data) {
      const songs =  $songsForAlbum.data.albums?.reduce<Array<Song>>((acc,curr) => { 
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { songs }})
      const albumId = songs?.at(0)!.albumId
      const artistId = songs?.at(0)!.artistId 
      if (albumId && artistId) {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [artistId] } , mode: FilterMode.ADDITIVE })
      }
    }

  }, [$songsForAlbum.loading, $songsForAlbum.data, musicDispatch])

  const dispatchToRater = (addition:RaterEntityRequest, shouldRemove:boolean) => {
    if (shouldRemove) {
      if (!addition.albumId) {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [addition.artist.id] }, mode: FilterMode.REDUCTIVE })
      } else {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { albumIds: [addition.albumId] }, mode: FilterMode.REDUCTIVE })
      }
    } else {
      if (!addition.albumId) {
        $loadArtistFull({ variables: { artistName: addition.artist.name } })
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds:[addition.artist.id] }, mode:FilterMode.ADDITIVE })
      } else {
        $loadSongsForAlbum({ variables: { albumIds: [addition.albumId] } })
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [addition.artist.id], albumIds: [addition.albumId] } , mode: FilterMode.ADDITIVE })
      }
    }
  } 
  const [contextArtists, setContextArtists] = useState<Artist[]>([])

  const openArtistOverview = (artist:Artist) => { 
    if (contextArtists.includes(artist)) {
      setContextArtists(contextArtists.filter(it => it.id !== artist.id))
    } else {
      setContextArtists([...contextArtists, artist])
    }
  }
  const onContextArtistClose = (artist:Artist) => { 
    setContextArtists(contextArtists.filter(it => it.id !== artist.id))
  }

  const items = musicStateOperator.getFatSongs()
       

        return <>
          {$artistsPage.data?.artists && 
            <MusicNavigatorPanel openArtistOverview={openArtistOverview} dispatchToRater={dispatchToRater} artists={$artistsPage.data?.artists.content as Artist[]}></MusicNavigatorPanel>
          }
        {/* <ContextManager onClose={onContextArtistClose}  musicDispatch={musicDispatch} artists={contextArtists} /> */}
        <div id="rater">
          {raterStyle === RaterStyle.GRID && <GridRater items={items} />}
          {raterStyle === RaterStyle.LIST && <BlockRater items={items} />}
          {/* {raterStyle === RaterStyle.CARTESIAN && 
            <CartesianRaterWrapper
            items={raterItems}
            musicDispatch={musicDispatch}
            musicState={musicState}
            />
          } */}
        </div></>
}