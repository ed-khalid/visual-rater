import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  vendorId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  isComplete?: Maybe<Scalars['Boolean']>;
  year?: Maybe<Scalars['Int']>;
  thumbnail?: Maybe<Scalars['String']>;
  songs: Array<Song>;
};

export type AlbumInput = {
  vendorId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['Int']>;
};

export type AlbumSearchResult = {
  __typename?: 'AlbumSearchResult';
  id: Scalars['String'];
  name: Scalars['String'];
  thumbnail: Scalars['String'];
  year?: Maybe<Scalars['Int']>;
};

export type Artist = {
  __typename?: 'Artist';
  id: Scalars['String'];
  vendorId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
  albums?: Maybe<Array<Maybe<Album>>>;
};

export type ArtistInput = {
  vendorId?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
};

export type ArtistSearchResult = {
  __typename?: 'ArtistSearchResult';
  name: Scalars['String'];
  id: Scalars['String'];
  thumbnail?: Maybe<Scalars['String']>;
  albums?: Maybe<Array<AlbumSearchResult>>;
};

export type Item = {
  id: Scalars['String'];
  name: Scalars['String'];
  score: Scalars['Float'];
};

export enum ItemType {
  Music = 'MUSIC'
}

export type Mutation = {
  __typename?: 'Mutation';
  CreateSong?: Maybe<Song>;
  UpdateSong?: Maybe<Song>;
  DeleteSong?: Maybe<Scalars['Boolean']>;
  UpdateAlbum?: Maybe<Album>;
};


export type MutationCreateSongArgs = {
  song?: Maybe<NewSongInput>;
};


export type MutationUpdateSongArgs = {
  song?: Maybe<SongInput>;
};


export type MutationDeleteSongArgs = {
  songId: Scalars['String'];
};


export type MutationUpdateAlbumArgs = {
  albumId?: Maybe<Scalars['String']>;
  isComplete?: Maybe<Scalars['Boolean']>;
};

export type NewSongInput = {
  vendorId?: Maybe<Scalars['String']>;
  score: Scalars['Float'];
  name: Scalars['String'];
  number?: Maybe<Scalars['Int']>;
  discNumber?: Maybe<Scalars['Int']>;
  album?: Maybe<AlbumInput>;
  artist?: Maybe<ArtistInput>;
};

export type Query = {
  __typename?: 'Query';
  search?: Maybe<SearchQuery>;
  artists?: Maybe<Array<Artist>>;
};

export type SearchQuery = {
  __typename?: 'SearchQuery';
  id: Scalars['String'];
  artist: ArtistSearchResult;
  tracks: Array<TrackSearchResult>;
};


export type SearchQueryArtistArgs = {
  name?: Maybe<Scalars['String']>;
  vendorId?: Maybe<Scalars['String']>;
};


export type SearchQueryTracksArgs = {
  albumId: Scalars['String'];
};

export type Song = Item & {
  __typename?: 'Song';
  id: Scalars['String'];
  vendorId?: Maybe<Scalars['String']>;
  score: Scalars['Float'];
  name: Scalars['String'];
  artist: Artist;
  number: Scalars['Int'];
  discNumber: Scalars['Int'];
  album?: Maybe<Album>;
};

export type SongInput = {
  id: Scalars['String'];
  score: Scalars['Float'];
};

export type TrackSearchResult = {
  __typename?: 'TrackSearchResult';
  id: Scalars['String'];
  name: Scalars['String'];
  trackNumber: Scalars['Int'];
  discNumber: Scalars['Int'];
};

export type CreateSongMutationVariables = Exact<{
  song?: Maybe<NewSongInput>;
}>;


export type CreateSongMutation = (
  { __typename?: 'Mutation' }
  & { CreateSong?: Maybe<(
    { __typename?: 'Song' }
    & SongFieldsFragment
  )> }
);

export type DeleteSongMutationVariables = Exact<{
  songId: Scalars['String'];
}>;


export type DeleteSongMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'DeleteSong'>
);

export type UpdateAlbumMutationVariables = Exact<{
  albumId: Scalars['String'];
  isComplete: Scalars['Boolean'];
}>;


export type UpdateAlbumMutation = (
  { __typename?: 'Mutation' }
  & { UpdateAlbum?: Maybe<(
    { __typename?: 'Album' }
    & Pick<Album, 'id' | 'isComplete'>
  )> }
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
  & { artists?: Maybe<Array<(
    { __typename?: 'Artist' }
    & Pick<Artist, 'id' | 'vendorId' | 'name' | 'thumbnail'>
    & { albums?: Maybe<Array<Maybe<(
      { __typename?: 'Album' }
      & Pick<Album, 'id' | 'name' | 'year' | 'thumbnail' | 'vendorId'>
      & { songs: Array<(
        { __typename?: 'Song' }
        & SongFieldsFragment
      )> }
    )>>> }
  )>> }
);

export type GetTracksForAlbumQueryVariables = Exact<{
  albumId: Scalars['String'];
}>;


export type GetTracksForAlbumQuery = (
  { __typename?: 'Query' }
  & { search?: Maybe<(
    { __typename?: 'SearchQuery' }
    & Pick<SearchQuery, 'id'>
    & { tracks: Array<(
      { __typename?: 'TrackSearchResult' }
      & Pick<TrackSearchResult, 'id' | 'name' | 'trackNumber' | 'discNumber'>
    )> }
  )> }
);

export type SearchByArtistQueryVariables = Exact<{
  name?: Maybe<Scalars['String']>;
  vendorId?: Maybe<Scalars['String']>;
}>;


export type SearchByArtistQuery = (
  { __typename?: 'Query' }
  & { search?: Maybe<(
    { __typename?: 'SearchQuery' }
    & Pick<SearchQuery, 'id'>
    & { artist: (
      { __typename?: 'ArtistSearchResult' }
      & Pick<ArtistSearchResult, 'name' | 'id' | 'thumbnail'>
      & { albums?: Maybe<Array<(
        { __typename?: 'AlbumSearchResult' }
        & Pick<AlbumSearchResult, 'id' | 'name' | 'year' | 'thumbnail'>
      )>> }
    ) }
  )> }
);

export type SongFieldsFragment = (
  { __typename?: 'Song' }
  & Pick<Song, 'id' | 'vendorId' | 'name' | 'number' | 'discNumber' | 'score'>
);

export const SongFieldsFragmentDoc = gql`
    fragment SongFields on Song {
  id
  vendorId
  name
  number
  discNumber
  score
}
    `;
export const CreateSongDocument = gql`
    mutation CreateSong($song: NewSongInput) {
  CreateSong(song: $song) {
    ...SongFields
  }
}
    ${SongFieldsFragmentDoc}`;
export type CreateSongMutationFn = ApolloReactCommon.MutationFunction<CreateSongMutation, CreateSongMutationVariables>;

/**
 * __useCreateSongMutation__
 *
 * To run a mutation, you first call `useCreateSongMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSongMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSongMutation, { data, loading, error }] = useCreateSongMutation({
 *   variables: {
 *      song: // value for 'song'
 *   },
 * });
 */
export function useCreateSongMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateSongMutation, CreateSongMutationVariables>) {
        return ApolloReactHooks.useMutation<CreateSongMutation, CreateSongMutationVariables>(CreateSongDocument, baseOptions);
      }
export type CreateSongMutationHookResult = ReturnType<typeof useCreateSongMutation>;
export type CreateSongMutationResult = ApolloReactCommon.MutationResult<CreateSongMutation>;
export type CreateSongMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateSongMutation, CreateSongMutationVariables>;
export const DeleteSongDocument = gql`
    mutation DeleteSong($songId: String!) {
  DeleteSong(songId: $songId)
}
    `;
export type DeleteSongMutationFn = ApolloReactCommon.MutationFunction<DeleteSongMutation, DeleteSongMutationVariables>;

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
export function useDeleteSongMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteSongMutation, DeleteSongMutationVariables>) {
        return ApolloReactHooks.useMutation<DeleteSongMutation, DeleteSongMutationVariables>(DeleteSongDocument, baseOptions);
      }
export type DeleteSongMutationHookResult = ReturnType<typeof useDeleteSongMutation>;
export type DeleteSongMutationResult = ApolloReactCommon.MutationResult<DeleteSongMutation>;
export type DeleteSongMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteSongMutation, DeleteSongMutationVariables>;
export const UpdateAlbumDocument = gql`
    mutation UpdateAlbum($albumId: String!, $isComplete: Boolean!) {
  UpdateAlbum(albumId: $albumId, isComplete: $isComplete) {
    id
    isComplete
  }
}
    `;
export type UpdateAlbumMutationFn = ApolloReactCommon.MutationFunction<UpdateAlbumMutation, UpdateAlbumMutationVariables>;

/**
 * __useUpdateAlbumMutation__
 *
 * To run a mutation, you first call `useUpdateAlbumMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAlbumMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAlbumMutation, { data, loading, error }] = useUpdateAlbumMutation({
 *   variables: {
 *      albumId: // value for 'albumId'
 *      isComplete: // value for 'isComplete'
 *   },
 * });
 */
export function useUpdateAlbumMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateAlbumMutation, UpdateAlbumMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateAlbumMutation, UpdateAlbumMutationVariables>(UpdateAlbumDocument, baseOptions);
      }
export type UpdateAlbumMutationHookResult = ReturnType<typeof useUpdateAlbumMutation>;
export type UpdateAlbumMutationResult = ApolloReactCommon.MutationResult<UpdateAlbumMutation>;
export type UpdateAlbumMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateAlbumMutation, UpdateAlbumMutationVariables>;
export const UpdateSongDocument = gql`
    mutation UpdateSong($song: SongInput) {
  UpdateSong(song: $song) {
    ...SongFields
  }
}
    ${SongFieldsFragmentDoc}`;
export type UpdateSongMutationFn = ApolloReactCommon.MutationFunction<UpdateSongMutation, UpdateSongMutationVariables>;

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
export function useUpdateSongMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateSongMutation, UpdateSongMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateSongMutation, UpdateSongMutationVariables>(UpdateSongDocument, baseOptions);
      }
export type UpdateSongMutationHookResult = ReturnType<typeof useUpdateSongMutation>;
export type UpdateSongMutationResult = ApolloReactCommon.MutationResult<UpdateSongMutation>;
export type UpdateSongMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateSongMutation, UpdateSongMutationVariables>;
export const GetArtistsDocument = gql`
    query getArtists {
  artists {
    id
    vendorId
    name
    thumbnail
    albums {
      id
      name
      year
      thumbnail
      vendorId
      songs {
        ...SongFields
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
export function useGetArtistsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetArtistsQuery, GetArtistsQueryVariables>) {
        return ApolloReactHooks.useQuery<GetArtistsQuery, GetArtistsQueryVariables>(GetArtistsDocument, baseOptions);
      }
export function useGetArtistsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetArtistsQuery, GetArtistsQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetArtistsQuery, GetArtistsQueryVariables>(GetArtistsDocument, baseOptions);
        }
export type GetArtistsQueryHookResult = ReturnType<typeof useGetArtistsQuery>;
export type GetArtistsLazyQueryHookResult = ReturnType<typeof useGetArtistsLazyQuery>;
export type GetArtistsQueryResult = ApolloReactCommon.QueryResult<GetArtistsQuery, GetArtistsQueryVariables>;
export const GetTracksForAlbumDocument = gql`
    query GetTracksForAlbum($albumId: String!) {
  search {
    id
    tracks(albumId: $albumId) {
      id
      name
      trackNumber
      discNumber
    }
  }
}
    `;

/**
 * __useGetTracksForAlbumQuery__
 *
 * To run a query within a React component, call `useGetTracksForAlbumQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTracksForAlbumQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTracksForAlbumQuery({
 *   variables: {
 *      albumId: // value for 'albumId'
 *   },
 * });
 */
export function useGetTracksForAlbumQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetTracksForAlbumQuery, GetTracksForAlbumQueryVariables>) {
        return ApolloReactHooks.useQuery<GetTracksForAlbumQuery, GetTracksForAlbumQueryVariables>(GetTracksForAlbumDocument, baseOptions);
      }
export function useGetTracksForAlbumLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetTracksForAlbumQuery, GetTracksForAlbumQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetTracksForAlbumQuery, GetTracksForAlbumQueryVariables>(GetTracksForAlbumDocument, baseOptions);
        }
export type GetTracksForAlbumQueryHookResult = ReturnType<typeof useGetTracksForAlbumQuery>;
export type GetTracksForAlbumLazyQueryHookResult = ReturnType<typeof useGetTracksForAlbumLazyQuery>;
export type GetTracksForAlbumQueryResult = ApolloReactCommon.QueryResult<GetTracksForAlbumQuery, GetTracksForAlbumQueryVariables>;
export const SearchByArtistDocument = gql`
    query SearchByArtist($name: String, $vendorId: String) {
  search {
    id
    artist(name: $name, vendorId: $vendorId) {
      name
      id
      thumbnail
      albums {
        id
        name
        year
        thumbnail
      }
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
 *      vendorId: // value for 'vendorId'
 *   },
 * });
 */
export function useSearchByArtistQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SearchByArtistQuery, SearchByArtistQueryVariables>) {
        return ApolloReactHooks.useQuery<SearchByArtistQuery, SearchByArtistQueryVariables>(SearchByArtistDocument, baseOptions);
      }
export function useSearchByArtistLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SearchByArtistQuery, SearchByArtistQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<SearchByArtistQuery, SearchByArtistQueryVariables>(SearchByArtistDocument, baseOptions);
        }
export type SearchByArtistQueryHookResult = ReturnType<typeof useSearchByArtistQuery>;
export type SearchByArtistLazyQueryHookResult = ReturnType<typeof useSearchByArtistLazyQuery>;
export type SearchByArtistQueryResult = ApolloReactCommon.QueryResult<SearchByArtistQuery, SearchByArtistQueryVariables>;