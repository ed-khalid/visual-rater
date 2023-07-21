import { Dispatch, SetStateAction } from "react";
import { Album, Artist } from "../generated/graphql";
import { Breadcrumb } from "../components/panels/BreadcrumbPanel";
import { MusicAction } from "../reducers/musicReducer";




export const BreadcrumbBuilder = {
    buildArtistBreadcrumb: (artist:Artist, musicDispatch:Dispatch<MusicAction>, setBreadcrumbs:Dispatch<SetStateAction<Array<Breadcrumb>>>) => {
        return {
            title: artist.name 
            ,action:  () => {
                musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds: [artist.id] , albumIds: [], songIds: [], scoreFilter: { start:0,end:5}}})
                setBreadcrumbs(breadcrumbs => ([breadcrumbs[0], breadcrumbs[1]]))
              }
           }
    },

    buildAlbumBreadcrumb: (album:Album) => {
        return {
            title: album.name 
            ,action:  () => {}
        }
    }

}    

