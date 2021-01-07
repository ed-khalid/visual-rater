import React, { useEffect, useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { ListControlNav } from './components/ListControlNav';
import { Rater } from './components/rater/Rater';
import { Item, ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { Search } from './components/Search';
import { AlbumSearchResult, Artist, ArtistSearchResult, Song, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
import { SpotifyPlayer } from './components/SpotifyPlayer';
import { NewSong } from './models/music/Song';
import { Dashboard } from './components/dashboard/Dashboard';

export const AppConstants = {
  rater : {
      position : {
        x: 300,
        y: 905
      }
  }
}

function App() {
  const UNRATED_ITEMS_PAGE_SIZE = 15
  const ITEM_TYPE = ItemType.MUSIC
  const [unratedItems, updateUnratedItems] = useState<Item[]>([])  
  const [ratedItems, setRatedItems] = useState<RatedItem[]>([]) 
  const [, updateDraggedItem] = useState<Item|undefined>(undefined) 
  const [chosenAlbum, setChosenAlbum] = useState<AlbumSearchResult|undefined>(undefined); 
  const [draggedItemIsAboveRater, updateDraggedItemIsAboveRater] = useState(false)
  const [unratedPageNumber, setUnratedPageNumber] = useState<number>(1) 
  const [draggedAlbum, setDraggedAlbum] = useState<AlbumSearchResult|undefined>(undefined) 
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  
  const [scaler, setScaler] = useState<Scaler>(new Scaler())
  const [chosenArtist, setChosenArtist] = useState<ArtistSearchResult|undefined>(undefined); 
  const [artists, setArtists] = useState<Artist[]>([]) 
  const artistsFull =  useGetArtistsQuery()

  useEffect(() => {
    if (chosenAlbum) {
      getTracks({ variables: { albumId: chosenAlbum.id} })
    }
  }, [chosenAlbum])
  useEffect(() => {
      if (tracks.data?.search?.tracks && chosenAlbum && chosenArtist) {
          let { albums, ...artistWithoutAlbums } = chosenArtist  
          let unratedSongs:NewSong[] = tracks.data.search.tracks.map(track =>({ id:track.id, vendorId:track.id, name:track.name, artist:artistWithoutAlbums , album:chosenAlbum, number:track.trackNumber, discNumber: track.discNumber}))
          unratedSongs = unratedSongs.filter(it => !ratedItems.find(rIt => ((rIt as Song).vendorId === it.id)))
          updateUnratedItems(unratedSongs)
  }}, [tracks.data])
  useEffect(() => {
    if (artistsFull.error) {
      console.log(artistsFull.error)
    }
    else  {
      if (artistsFull.data && artistsFull.data.artists) {
        setArtists(artistsFull.data.artists)
        const songs:Song[] = artistsFull.data.artists.reduce((curr:Song[],it) => {
          if (it.albums) {
            it.albums.forEach(album => {
              if (album && album.songs) {
                album.songs.forEach(song => {
                  if (song) {
                    curr.push( { ...song, artist: it  })
                  }
                })
              }
            })
          }
          return curr
        },[])
        setRatedItems(songs.map(it => new RatedItem({ id: it.id, vendorId:it.vendorId, name: it.name },it.score)));
      }
    }
  } , [artistsFull.data, artistsFull.error])

  const handleAlbumDragOver = (e:any) => {
    e.preventDefault()
  }
  const handleAlbumDrop = (e:React.DragEvent<SVGSVGElement>) => {
    if (draggedAlbum) {
      setChosenAlbum(draggedAlbum)
      setDraggedAlbum(undefined)
    }
  }

  return (
    <div className="App">
      <header className="font-title">VisRater</header>
      <div className="main grid">
        <div className="empty-cell"></div> 
        <div id="top-controls">
          { unratedItems.length > UNRATED_ITEMS_PAGE_SIZE && 
            <ListControlNav setPageNumber={setUnratedPageNumber} numberOfPages={Math.ceil(unratedItems.length/UNRATED_ITEMS_PAGE_SIZE)}  ></ListControlNav> 
          }
        </div>
        <div className="empty-cell"></div> 
        <div id="search-wrapper">
          <Search 
             chosenAlbum={chosenAlbum} 
             setChosenAlbum={setChosenAlbum} 
             setChosenArtist={setChosenArtist}
             setDraggedAlbum={setDraggedAlbum}
             setUnrated={updateUnratedItems}
          />
          <SpotifyPlayer albumId={chosenAlbum?.id}></SpotifyPlayer>
        </div>
        <svg onDragOver={(e) => handleAlbumDragOver(e)} onDrop={(e) => handleAlbumDrop(e) } id="trackRater" viewBox="0 0 790 950">
          <Unrated 
                  unratedItems={unratedItems} 
                  ratedItems={ratedItems} 
                  onDrag={updateDraggedItem}
                  onRater={updateDraggedItemIsAboveRater}
                  updateItems={[updateUnratedItems, setRatedItems]} 
                  pageNumber={unratedPageNumber}  
                  pageSize = {UNRATED_ITEMS_PAGE_SIZE}
                  scaler={scaler}
                  itemType={ITEM_TYPE}
          > 
          </Unrated>
          <Rater 
                highlight={draggedItemIsAboveRater} 
                ratedItems={ratedItems}  
                updateRatedItems={setRatedItems}
                scaler={scaler}
                setScaler={setScaler}
                itemType={ITEM_TYPE}
          >
          </Rater>
        </svg>
        <Dashboard artists={artists} />
      </div>
    </div>
  );
}

export default App;
