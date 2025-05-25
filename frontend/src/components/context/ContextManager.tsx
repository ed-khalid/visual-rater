import { useEffect, useState } from "react"
import { Album, Artist } from "../../generated/graphql"
import { ContextPanel, ContextPanelAlbumModel, ContextPanelArtistModel, ContextPanelBaseModel } from './ContextPanel'
import { useMusicDispatch } from "../../hooks/MusicStateHooks"

interface Props {
    item: { id: string, type: 'artist'|'album' }
    artists: Artist[]
    onClose: (artist:Artist) => void 
}

export const ContextManager = ({artists, onClose}:Props) => {

    const musicDispatch = useMusicDispatch()

    const [collapsedPanels, setCollpasedPanels] = useState<ContextPanelBaseModel[]>([])
    const [expandedPanels, setExpandedPanels] = useState<ContextPanelBaseModel[]>([])

    const onToggle = (panelModel:ContextPanelBaseModel) => {
        if (collapsedPanels.some(it => it.id === panelModel.id)) {
            if (expandedPanels.length > 2) {
                const newCollapsedPanels = collapsedPanels.filter(it => it.id !== panelModel.id)
                const firstExpanded = expandedPanels[0] 
                setCollpasedPanels([...newCollapsedPanels, firstExpanded ])
                const newExpandedArtists = expandedPanels.filter(it => it.id !== firstExpanded.id) 
                setExpandedPanels([panelModel, ...newExpandedArtists])
            } else {
                setCollpasedPanels(collapsedPanels.filter(it => it.id !== panelModel.id))
                setExpandedPanels([panelModel, ...expandedPanels])
            }
        } else {
            setExpandedPanels(expandedPanels.filter(it => it.id !== panelModel.id))
            setCollpasedPanels([...collapsedPanels, panelModel])
        }
    }

    const onAlbumExpand = (album:Album) => {
        const artistPanel = expandedPanels.find(it => it.type === 'artist-panel' && it.data.id === album.artistId)   
        if (!artistPanel) {
            throw "Artist panel not found for album " + album.name
        }
        const indexOfArtistPanel = expandedPanels.indexOf(artistPanel) 
        const panelModel:ContextPanelAlbumModel = {
            id: album.id,
            title: artistPanel.data.name + '- ' + album.name,
            type: 'album-panel',
            data: album, 
            artist: artistPanel.data as Artist, 
        }
        const newExpandedPanels = [...expandedPanels] 
        newExpandedPanels[indexOfArtistPanel] = panelModel
        setExpandedPanels(newExpandedPanels)
    }

    const onClickArtistName = (artist:Artist) => {
        const albumPanel =  expandedPanels.find(it => it.type === 'album-panel' && (it as ContextPanelAlbumModel).artist.id === artist.id)  
        if (!albumPanel) {
            throw "Album panel not found for artist " + artist.name
        }
        const indexOfAlbumPanel = expandedPanels.indexOf(albumPanel)  
        const artistPanelModel:ContextPanelArtistModel = {
            id: artist.id,
            title: artist.name,
            type: 'artist-panel',
            data: artist
        } 
        const newExpandedPanels = [...expandedPanels]
        newExpandedPanels[indexOfAlbumPanel] = artistPanelModel
        setExpandedPanels(newExpandedPanels)
    }


    useEffect(() => {
        const isArtistContextCollapsed = (artist:Artist) => {
            const indexOfArtist = artists.findIndex(it => it.id === artist.id)  
            return artists.length > 3 && (artists.length - indexOfArtist) > 3 
        } 
        const collapsedArtists:Artist[] = [] 
        const expandedArtists:Artist[] = [] 
        artists.forEach( artist => {
            if (isArtistContextCollapsed(artist)) {
                collapsedArtists.push(artist)
            } else {
                expandedArtists.push(artist)
            }
        })
        setExpandedPanels(expandedArtists.map(artist => ({ id: artist.id, type: 'artist-panel', title:  artist.name, data: artist  })  ))
        setCollpasedPanels(collapsedArtists.map(artist => ({ id: artist.id, type: 'artist-panel', title: artist.name, data: artist })))  
    }, [artists])

    const onCloseArtist = (model:ContextPanelBaseModel) => {
        onClose(model.data as Artist)
    }


    return <div id="context">
        {collapsedPanels.map(panel => <ContextPanel onClickArtistName={onClickArtistName} musicDispatch={musicDispatch} model={panel} key={'context-panel'+panel.id} onToggle={onToggle} onClose={onCloseArtist} isCollapsed={true} > 
        </ContextPanel> ) }
        {expandedPanels.map(panel => <ContextPanel onClickArtistName={onClickArtistName} onExpandAlbum={onAlbumExpand} musicDispatch={musicDispatch} model={panel} key={'context-artist'+panel.id} onClose={onCloseArtist} onToggle={onToggle} isCollapsed={false} /> ) }
    </div>



} 