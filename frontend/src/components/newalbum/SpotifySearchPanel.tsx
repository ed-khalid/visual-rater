import { useState } from 'react'
import { ExternalAlbumSearchResult, ExternalArtistSearchResult, useSearchExternalArtistQuery } from '../../generated/graphql'
import { Panel } from '../common/Panel'
import './SpotifySearchPanel.css'

interface Props {
    term: string
    onFinishAlbumSelections : any
    onCancel: any

}

export const SpotifySearchPanel = ({term, onFinishAlbumSelections, onCancel}: Props) => {

   const {data ,error,loading} = useSearchExternalArtistQuery({ variables: { name: term  }}) 
   const [selectedAlbums, setSelectedAlbums] = useState<ExternalAlbumSearchResult[]>([])

   const onExternalAlbumSelect = (album:ExternalAlbumSearchResult) => {
    const isSelected = selectedAlbums.find(a => a.id === album.id)  
    if (isSelected) {
        setSelectedAlbums(selectedAlbums.filter(a => a.id !== album.id))
    } else {
        setSelectedAlbums([...selectedAlbums, album])
    }

   }

   const submit = (artist:ExternalArtistSearchResult) => {
        if (selectedAlbums.length > 0) {
            onFinishAlbumSelections(artist, selectedAlbums)
        } else {
            onCancel()
        }
   } 

    return <Panel title="Spotify Search" id="spotify-search" isCloseable={true} onClose={onCancel}>
        
        <div>
                        {loading && <p>Loading...</p> }
                        {error && <p>Error!</p> }
                        {data?.searchExternalArtist && 
                                <div id="search-results-artist" className="flex column">
                                    <div id="search-action">
                                        <button onClick={()=> submit(data?.searchExternalArtist)}>ADD</button>
                                    </div>
                                    <div id="search-result-header">
                                        <div id="search-results-artist-thumbnail">
                                            <img className="search-artist-thumbnail" src={data?.searchExternalArtist.thumbnail || ''} alt={""} /> 
                                        </div> 
                                        <div id="search-artist-title" className="font-title" key={"external-artist" + data?.searchExternalArtist.name}>
                                            {data?.searchExternalArtist.name}
                                        </div>
                                    </div>

                                    <div id="search-result-albums">
                                            {data?.searchExternalArtist.albums.map(album => 
                                            <div className={"search-result-album" + ((selectedAlbums.find(it => it.id === album.id)) ? ' selected' : '') }  onClick={()=> onExternalAlbumSelect(album) } key={'external-album'+album.name}>
                                                <div className="search-result-album-thumbnail">
                                                    <img alt={album.name} src={album.thumbnail || '' } />
                                                </div>
                                                <div className="search-result-album-text">
                                                    <div className="search-result-album-name">{album.name}</div>
                                                    <div className="search-result-album-year">{album.year}</div>
                                                </div> 
                                            </div>
                                            )}
                                    </div>
                                </div>
                        }

        </div>

    </Panel>

}