import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Album = {
  __typename?: 'Album';
  id: Scalars['String'];
  name: Scalars['String'];
  year?: Maybe<Scalars['Int']>;
  thumbnail?: Maybe<Scalars['String']>;
  songs: Array<Song>;
  score?: Maybe<Scalars['Float']>;
};

export type Artist = Pageable & {
  __typename?: 'Artist';
  id: Scalars['String'];
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
  albums?: Maybe<Array<Maybe<Album>>>;
  score?: Maybe<Scalars['Float']>;
  metadata?: Maybe<ArtistMetadata>;
};

export type ArtistInput = {
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
};

export type ArtistMetadata = {
  __typename?: 'ArtistMetadata';
  songs: ArtistSongMetadata;
  totalSongs: Scalars['Int'];
  totalAlbums: Scalars['Int'];
};

export type ArtistPage = Page & {
  __typename?: 'ArtistPage';
  total: Scalars['Int'];
  pageNumber: Scalars['Int'];
  content: Array<Maybe<Artist>>;
};

export type ArtistSongMetadata = {
  __typename?: 'ArtistSongMetadata';
  classic: Scalars['Int'];
  great: Scalars['Int'];
  good: Scalars['Int'];
  mediocre: Scalars['Int'];
  bad: Scalars['Int'];
  terrible: Scalars['Int'];
  classicPercentage: Scalars['Float'];
  greatPercentage: Scalars['Float'];
  goodPercentage: Scalars['Float'];
  mediocrePercentage: Scalars['Float'];
  badPercentage: Scalars['Float'];
  terriblePercentage: Scalars['Float'];
};

export type ExternalAlbumSearchResult = {
  __typename?: 'ExternalAlbumSearchResult';
  id: Scalars['String'];
  name: Scalars['String'];
  thumbnail: Scalars['String'];
  year?: Maybe<Scalars['Int']>;
};

export type ExternalArtistSearchResult = {
  __typename?: 'ExternalArtistSearchResult';
  name: Scalars['String'];
  id: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
  albums: Array<ExternalAlbumSearchResult>;
};

export type ExternalTrackSearchResult = {
  __typename?: 'ExternalTrackSearchResult';
  id: Scalars['String'];
  name: Scalars['String'];
  trackNumber: Scalars['Int'];
  discNumber: Scalars['Int'];
};

export type Item = {
  id: Scalars['String'];
  name: Scalars['String'];
  score?: Maybe<Scalars['Float']>;
};

export enum ItemType {
  Music = 'MUSIC'
}

export type Mutation = {
  __typename?: 'Mutation';
  CreateAlbum?: Maybe<Album>;
  CreateArtist?: Maybe<Artist>;
  UpdateSong?: Maybe<Song>;
  DeleteSong?: Maybe<Scalars['Boolean']>;
  DeleteAlbum?: Maybe<Scalars['Boolean']>;
};


export type MutationCreateAlbumArgs = {
  album?: Maybe<NewAlbumInput>;
};


export type MutationCreateArtistArgs = {
  artist?: Maybe<ArtistInput>;
};


export type MutationUpdateSongArgs = {
  song?: Maybe<SongInput>;
};


export type MutationDeleteSongArgs = {
  songId: Scalars['String'];
};


export type MutationDeleteAlbumArgs = {
  albumId: Scalars['String'];
};

export type NewAlbumInput = {
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['Int']>;
  artistId: Scalars['String'];
  songs?: Maybe<Array<NewSongInput>>;
};

export type NewSongInput = {
  score?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  number?: Maybe<Scalars['Int']>;
  discNumber?: Maybe<Scalars['Int']>;
};

export type Page = {
  total: Scalars['Int'];
  pageNumber: Scalars['Int'];
  content?: Maybe<Array<Maybe<Pageable>>>;
};

export type Pageable = {
  id: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  searchExternalArtist?: Maybe<ExternalArtistSearchResult>;
  searchExternalAlbumTracks: Array<ExternalTrackSearchResult>;
  artists: ArtistPage;
  artist?: Maybe<Artist>;
};


export type QuerySearchExternalArtistArgs = {
  name?: Maybe<Scalars['String']>;
};


export type QuerySearchExternalAlbumTracksArgs = {
  albumId?: Maybe<Scalars['String']>;
};


export type QueryArtistArgs = {
  name?: Maybe<Scalars['String']>;
};

export type Song = Item & {
  __typename?: 'Song';
  id: Scalars['String'];
  score?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  number: Scalars['Int'];
  discNumber: Scalars['Int'];
};

export type SongInput = {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['Int']>;
  score?: Maybe<Scalars['Float']>;
};

export type CreateAlbumMutationVariables = Exact<{
  albumInput?: Maybe<NewAlbumInput>;
}>;


export type CreateAlbumMutation = (
  { __typename?: 'Mutation' }
  & { CreateAlbum?: Maybe<(
    { __typename?: 'Album' }
    & Pick<Album, 'id' | 'name' | 'year' | 'thumbnail'>
    & { songs: Array<(
      { __typename?: 'Song' }
      & SongFieldsFragment
    )> }
  )> }
);

export type CreateArtistMutationVariables = Exact<{
  artistInput?: Maybe<ArtistInput>;
}>;


export type CreateArtistMutation = (
  { __typename?: 'Mutation' }
  & { CreateArtist?: Maybe<(
    { __typename?: 'Artist' }
    & Pick<Artist, 'id' | 'name' | 'thumbnail'>
  )> }
);

export type DeleteAlbumMutationVariables = Exact<{
  albumId: Scalars['String'];
}>;


export type DeleteAlbumMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'DeleteAlbum'>
);

export type DeleteSongMutationVariables = Exact<{
  songId: Scalars['String'];
}>;


export type DeleteSongMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'DeleteSong'>
);

export type UpdateSongMutationVariables = Exact<{
  song?: Maybe<SongInput>;
}>;


export type UpdateSongMutation = (
  { __typename?: 'Mutation' }
  & { UpdateSong?: Maybe<(
    { __typename?: 'Song' }
    & SongFieldsFragment
  )> }
);

export type GetArtistsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetArtistsQuery = (
  { __typename?: 'Query' }
  & { artists: (
    { __typename?: 'ArtistPage' }
    & Pick<ArtistPage, 'total' | 'pageNumber'>
    & { content: Array<Maybe<(
      { __typename?: 'Artist' }
      & Pick<Artist, 'id' | 'name' | 'thumbnail'>
      & { albums?: Maybe<Array<Maybe<(
        { __typename?: 'Album' }
        & Pick<Album, 'id' | 'name' | 'year' | 'thumbnail'>
        & { songs: Array<(
          { __typename?: 'Song' }
          & SongFieldsFragment
        )> }
      )>>> }
    )>> }
  ) }
);

export type GetTracksForSearchAlbumQueryVariables = Exact<{
  albumId: Scalars['String'];
}>;


export type GetTracksForSearchAlbumQuery = (
  { __typename?: 'Query' }
  & { searchExternalAlbumTracks: Array<(
    { __typename?: 'ExternalTrackSearchResult' }
    & Pick<ExternalTrackSearchResult, 'id' | 'name' | 'trackNumber' | 'discNumber'>
  )> }
);

export type SearchByArtistQueryVariables = Exact<{
  name?: Maybe<Scalars['String']>;
}>;


export type SearchByArtistQuery = (
  { __typename?: 'Query' }
  & { searchExternalArtist?: Maybe<(
    { __typename?: 'ExternalArtistSearchResult' }
    & Pick<ExternalArtistSearchResult, 'name' | 'id' | 'thumbnail'>
    & { albums: Array<(
      { __typename?: 'ExternalAlbumSearchResult' }
      & Pick<ExternalAlbumSearchResult, 'id' | 'name' | 'thumbnail' | 'year'>
    )> }
  )> }
);

export type SongFieldsFragment = (
  { __typename?: 'Song' }
  & Pick<Song, 'id' | 'name' | 'number' | 'discNumber' | 'score'>
);

export const SongFieldsFragmentDoc = gql`
    fragment SongFields on Song {
  id
  name
  number
  discNumber
  score
}
    `;
export const CreateAlbumDocument = gql`
    mutation CreateAlbum($albumInput: NewAlbumInput) {
  CreateAlbum(album: $albumInput) {
    id
    name
    year
    thumbnail
    songs {
      ...SongFields
    }
  }
}
    ${SongFieldsFragmentDoc}`;
export type CreateAlbumMutationFn = Apollo.MutationFunction<CreateAlbumMutation, CreateAlbumMutationVariables>;

/**
 * __useCreateAlbumMutation__
 *
 * To run a mutation, you first call `useCreateAlbumMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAlbumMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAlbumMutation, { data, loading, error }] = useCreateAlbumMutation({
 *   variables: {
 *      albumInput: // value for 'albumInput'
 *   },
 * });
 */
export function useCreateAlbumMutation(baseOptions?: Apollo.MutationHookOptions<CreateAlbumMutation, CreateAlbumMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAlbumMutation, CreateAlbumMutationVariables>(CreateAlbumDocument, options);
      }
export type CreateAlbumMutationHookResult = ReturnType<typeof useCreateAlbumMutation>;
export type CreateAlbumMutationResult = Apollo.MutationResult<CreateAlbumMutation>;
export type CreateAlbumMutationOptions = Apollo.BaseMutationOptions<CreateAlbumMutation, CreateAlbumMutationVariables>;
export const CreateArtistDocument = gql`
    mutation CreateArtist($artistInput: ArtistInput) {
  CreateArtist(artist: $artistInput) {
    id
    name
    thumbnail
  }
}
    `;
export type CreateArtistMutationFn = Apollo.MutationFunction<CreateArtistMutation, CreateArtistMutationVariables>;

/**
 * __useCreateArtistMutation__
 *
 * To run a mutation, you first call `useCreateArtistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateArtistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createArtistMutation, { data, loading, error }] = useCreateArtistMutation({
 *   variables: {
 *      artistInput: // value for 'artistInput'
 *   },
 * });
 */
export function useCreateArtistMutation(baseOptions?: Apollo.MutationHookOptions<CreateArtistMutation, CreateArtistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateArtistMutation, CreateArtistMutationVariables>(CreateArtistDocument, options);
      }
export type CreateArtistMutationHookResult = ReturnType<typeof useCreateArtistMutation>;
export type CreateArtistMutationResult = Apollo.MutationResult<CreateArtistMutation>;
export type CreateArtistMutationOptions = Apollo.BaseMutationOptions<CreateArtistMutation, CreateArtistMutationVariables>;
export const DeleteAlbumDocument = gql`
    mutation DeleteAlbum($albumId: String!) {
  DeleteAlbum(albumId: $albumId)
}
    `;
export type DeleteAlbumMutationFn = Apollo.MutationFunction<DeleteAlbumMutation, DeleteAlbumMutationVariables>;

/**
 * __useDeleteAlbumMutation__
 *
 * To run a mutation, you first call `useDeleteAlbumMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAlbumMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAlbumMutation, { data, loading, error }] = useDeleteAlbumMutation({
 *   variables: {
 *      albumId: // value for 'albumId'
 *   },
 * });
 */
export function useDeleteAlbumMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAlbumMutation, DeleteAlbumMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAlbumMutation, DeleteAlbumMutationVariables>(DeleteAlbumDocument, options);
      }
export type DeleteAlbumMutationHookResult = ReturnType<typeof useDeleteAlbumMutation>;
export type DeleteAlbumMutationResult = Apollo.MutationResult<DeleteAlbumMutation>;
export type DeleteAlbumMutationOptions = Apollo.BaseMutationOptions<DeleteAlbumMutation, DeleteAlbumMutationVariables>;
export const DeleteSongDocument = gql`
    mutation DeleteSong($songId: String!) {
  DeleteSong(songId: $songId)
}
    `;
export type DeleteSongMutationFn = Apollo.MutationFunction<DeleteSongMutation, DeleteSongMutationVariables>;

/**
 * __useDeleteSongMutation__
 *
 * To run a mutation, you first call `useDeleteSongMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSongMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSongMutation, { data, loading, error }] = useDeleteSongMutation({
 *   variables: {
 *      songId: // value for 'songId'
 *   },
 * });
 */
export function useDeleteSongMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSongMutation, DeleteSongMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSongMutation, DeleteSongMutationVariables>(DeleteSongDocument, options);
      }
export type DeleteSongMutationHookResult = ReturnType<typeof useDeleteSongMutation>;
export type DeleteSongMutationResult = Apollo.MutationResult<DeleteSongMutation>;
export type DeleteSongMutationOptions = Apollo.BaseMutationOptions<DeleteSongMutation, DeleteSongMutationVariables>;
export const UpdateSongDocument = gql`
    mutation UpdateSong($song: SongInput) {
  UpdateSong(song: $song) {
    ...SongFields
  }
}
    ${SongFieldsFragmentDoc}`;
export type UpdateSongMutationFn = Apollo.MutationFunction<UpdateSongMutation, UpdateSongMutationVariables>;

/**
 * __useUpdateSongMutation__
 *
 * To run a mutation, you first call `useUpdateSongMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSongMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSongMutation, { data, loading, error }] = useUpdateSongMutation({
 *   variables: {
 *      song: // value for 'song'
 *   },
 * });
 */
export function useUpdateSongMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSongMutation, UpdateSongMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSongMutation, UpdateSongMutationVariables>(UpdateSongDocument, options);
      }
export type UpdateSongMutationHookResult = ReturnType<typeof useUpdateSongMutation>;
export type UpdateSongMutationResult = Apollo.MutationResult<UpdateSongMutation>;
export type UpdateSongMutationOptions = Apollo.BaseMutationOptions<UpdateSongMutation, UpdateSongMutationVariables>;
export const GetArtistsDocument = gql`
    query getArtists {
  artists {
    total
    pageNumber
    content {
      id
      name
      thumbnail
      albums {
        id
        name
        year
        thumbnail
        songs {
          ...SongFields
        }
      }
    }
  }
}
    ${SongFieldsFragmentDoc}`;

/**
 * __useGetArtistsQuery__
 *
 * To run a query within a React component, call `useGetArtistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArtistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArtistsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetArtistsQuery(baseOptions?: Apollo.QueryHookOptions<GetArtistsQuery, GetArtistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArtistsQuery, GetArtistsQueryVariables>(GetArtistsDocument, options);
      }
export function useGetArtistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArtistsQuery, GetArtistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArtistsQuery, GetArtistsQueryVariables>(GetArtistsDocument, options);
        }
export type GetArtistsQueryHookResult = ReturnType<typeof useGetArtistsQuery>;
export type GetArtistsLazyQueryHookResult = ReturnType<typeof useGetArtistsLazyQuery>;
export type GetArtistsQueryResult = Apollo.QueryResult<GetArtistsQuery, GetArtistsQueryVariables>;
export const GetTracksForSearchAlbumDocument = gql`
    query GetTracksForSearchAlbum($albumId: String!) {
  searchExternalAlbumTracks(albumId: $albumId) {
    id
    name
    trackNumber
    discNumber
  }
}
    `;

/**
 * __useGetTracksForSearchAlbumQuery__
 *
 * To run a query within a React component, call `useGetTracksForSearchAlbumQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTracksForSearchAlbumQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTracksForSearchAlbumQuery({
 *   variables: {
 *      albumId: // value for 'albumId'
 *   },
 * });
 */
export function useGetTracksForSearchAlbumQuery(baseOptions: Apollo.QueryHookOptions<GetTracksForSearchAlbumQuery, GetTracksForSearchAlbumQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTracksForSearchAlbumQuery, GetTracksForSearchAlbumQueryVariables>(GetTracksForSearchAlbumDocument, options);
      }
export function useGetTracksForSearchAlbumLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTracksForSearchAlbumQuery, GetTracksForSearchAlbumQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTracksForSearchAlbumQuery, GetTracksForSearchAlbumQueryVariables>(GetTracksForSearchAlbumDocument, options);
        }
export type GetTracksForSearchAlbumQueryHookResult = ReturnType<typeof useGetTracksForSearchAlbumQuery>;
export type GetTracksForSearchAlbumLazyQueryHookResult = ReturnType<typeof useGetTracksForSearchAlbumLazyQuery>;
export type GetTracksForSearchAlbumQueryResult = Apollo.QueryResult<GetTracksForSearchAlbumQuery, GetTracksForSearchAlbumQueryVariables>;
export const SearchByArtistDocument = gql`
    query SearchByArtist($name: String) {
  searchExternalArtist(name: $name) {
    name
    id
    thumbnail
    albums {
      id
      name
      thumbnail
      year
    }
  }
}
    `;

/**
 * __useSearchByArtistQuery__
 *
 * To run a query within a React component, call `useSearchByArtistQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchByArtistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchByArtistQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSearchByArtistQuery(baseOptions?: Apollo.QueryHookOptions<SearchByArtistQuery, SearchByArtistQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchByArtistQuery, SearchByArtistQueryVariables>(SearchByArtistDocument, options);
      }
export function useSearchByArtistLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchByArtistQuery, SearchByArtistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchByArtistQuery, SearchByArtistQueryVariables>(SearchByArtistDocument, options);
        }
export type SearchByArtistQueryHookResult = ReturnType<typeof useSearchByArtistQuery>;
export type SearchByArtistLazyQueryHookResult = ReturnType<typeof useSearchByArtistLazyQuery>;
export type SearchByArtistQueryResult = Apollo.QueryResult<SearchByArtistQuery, SearchByArtistQueryVariables>;