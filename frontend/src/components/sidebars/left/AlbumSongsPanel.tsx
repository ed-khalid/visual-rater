import { Album, useGetAlbumsSongsQuery } from "../../../generated/graphql"

interface Props {
    album: Album
}

export const AlbumSongsPanel = ({album}: Props) => {

    const { data, loading, error} = useGetAlbumsSongsQuery({ variables: { albumIds: [album.id]}})


    return <div className="album-songs-panel">
        { data?.albums?.at(0)?.songs?.map(song =>
            <div key={`album-${album.id}-songs-${song.id}`} className="musical-panel-expandable-item album-songs">
                {song.name}
            </div>)}
    </div>
}