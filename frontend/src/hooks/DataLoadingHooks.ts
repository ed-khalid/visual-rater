import { SongQueryParams, useGetAlbumsPageQuery, useGetSongsPageQuery } from "../generated/graphql";

export const useGetAlbumsForArtist = (artistId:string) => useGetAlbumsPageQuery({ variables: { params: { artistIds: [artistId] } } })  

export const useGetSongsForAlbum =  (albumId:string) => useGetSongsPageQuery({ variables: { input: { albumIds:  [albumId] } } })   

export const useGetSongsForPlaylistRater = (input:SongQueryParams) => useGetSongsPageQuery({ variables: { input}, notifyOnNetworkStatusChange: true }) 