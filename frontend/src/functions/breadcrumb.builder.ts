import { Dispatch, SetStateAction } from "react";
import { Album, Artist } from "../generated/graphql";
import { BreadcrumbEntry } from "../components/floats/Breadcrumb";
import { MusicAction } from "../reducers/musicReducer";




export const BreadcrumbBuilder = {
    buildMixedBreadcrumb:() => {  return {
        title: 'MIXED'
        ,action: () => {}
    }},
    buildArtistBreadcrumb: (artist:Artist, musicDispatch:Dispatch<MusicAction>, setBreadcrumbs:Dispatch<SetStateAction<Array<BreadcrumbEntry>>>) => {
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

