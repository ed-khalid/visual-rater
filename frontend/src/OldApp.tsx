

export const OldApp = {} 

// import React, { useEffect, useState } from 'react';
// import './App.css';
// import { Unrated } from './components/Unrated';
// import { ListControlNav } from './components/ListControlNav';
// import { Rater } from './components/rater/Rater';
// import { Item, ItemType } from './models/Item';
// import { RatedItem } from './models/RatedItem';
// import { Scaler } from './functions/scale';
// import { Album, Artist, Song, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
// import { Dashboard } from './components/dashboard/Dashboard';

// export const AppConstants = {
//   rater : {
//       position : {
//         x: 300,
//         y: 905
//       }
//   }
// }




// function App() {
//   const UNRATED_ITEMS_PAGE_SIZE = 15
//   const ITEM_TYPE = ItemType.MUSIC
//   const [unratedItems, setUnratedItems] = useState<Item[]>([])  
//   const [ratedItems, setRatedItems] = useState<RatedItem[]>([]) 
//   const [, updateDraggedItem] = useState<Item|undefined>(undefined) 
//   const [draggedItemIsAboveRater, setDraggedItemIsAboveRater] = useState(false)
//   const [unratedPageNumber, setUnratedPageNumber] = useState<number>(1) 
//   const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  
//   const [scaler, setScaler] = useState<Scaler>(new Scaler())
//   const [artists, setArtists] = useState<Artist[]>([]) 
//   const [zoomReset, setZoomReset] = useState<boolean>(false)
//   const artistsFull =  useGetArtistsQuery()

//   const [dashboardToSearch, setDashboardToSearch] = useState<{artist:Artist,album:Album}|undefined>(); 

//   useEffect(() => {
//       if (tracks.data?.search?.tracks && searchState.artist) {
//           let { albums, ...artistWithoutAlbums } = searchState.artist  
//           let unratedSongs:NewSong[] = tracks.data.search.tracks.map(track =>({ id:track.id, vendorId:track.id, name:track.name, artist:artistWithoutAlbums , album:searchState.album, number:track.trackNumber, discNumber: track.discNumber}))
//           unratedSongs = unratedSongs.filter(it => !ratedItems.find(rIt => ((rIt as Song).vendorId === it.id)))
//           setUnratedItems(unratedSongs)
//   }}, [tracks.data])

//   return (
//           <Unrated 
//                   unratedItems={unratedItems} 
//                   ratedItems={ratedItems} 
//                   onDrag={updateDraggedItem}
//                   onRater={setDraggedItemIsAboveRater}
//                   updateItems={[setUnratedItems, setRatedItems]} 
//                   pageNumber={unratedPageNumber}  
//                   pageSize = {UNRATED_ITEMS_PAGE_SIZE}
//                   scaler={scaler}
//                   itemType={ITEM_TYPE}
//           > 
//           </Unrated>
//   );
// }

// export default App;
