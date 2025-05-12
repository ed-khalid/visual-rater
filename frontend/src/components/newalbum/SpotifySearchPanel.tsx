import { useSearchExternalArtistQuery } from '../../generated/graphql'
import { Panel } from '../common/Panel'
import './SpotifySearchPanel.css'

interface Props {
    term: string
    onExternalAlbumSelect : any
    onCancel: any

}

export const SpotifySearchPanel = ({term, onExternalAlbumSelect, onCancel}: Props) => {

   const {data ,error,loading} = useSearchExternalArtistQuery({ variables: { name: term  }}) 

    return <Panel title="Spotify Search" id="spotify-search" isCloseable={true} onClose={onCancel}>
        
        <div>
                        {loading && <p>Loading...</p> }
                        {error && <p>Error!</p> }
                        {data?.searchExternalArtist && 
                                <div id="search-results-artist" className="flex column">
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
                                            <div className="search-result-album" onClick={()=> onExternalAlbumSelect( data?.searchExternalArtist, album) } key={'external-album'+album.name}>
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