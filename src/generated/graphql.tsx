import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Album = {
  __typename?: 'Album';
  dominantColor?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  score?: Maybe<Scalars['Float']['output']>;
  songs: Array<Song>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type Artist = Pageable & {
  __typename?: 'Artist';
  albums?: Maybe<Array<Maybe<Album>>>;
  id: Scalars['String']['output'];
  metadata?: Maybe<ArtistMetadata>;
  name: Scalars['String']['output'];
  score?: Maybe<Scalars['Float']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type ArtistInput = {
  name: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};

export type ArtistMetadata = {
  __typename?: 'ArtistMetadata';
  songs: ArtistSongMetadata;
  totalAlbums: Scalars['Int']['output'];
  totalSongs: Scalars['Int']['output'];
};

export type ArtistPage = Page & {
  __typename?: 'ArtistPage';
  content: Array<Maybe<Artist>>;
  pageNumber: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ArtistSongMetadata = {
  __typename?: 'ArtistSongMetadata';
  bad: Scalars['Int']['output'];
  badPercentage: Scalars['Float']['output'];
  classic: Scalars['Int']['output'];
  classicPercentage: Scalars['Float']['output'];
  good: Scalars['Int']['output'];
  goodPercentage: Scalars['Float']['output'];
  great: Scalars['Int']['output'];
  greatPercentage: Scalars['Float']['output'];
  mediocre: Scalars['Int']['output'];
  mediocrePercentage: Scalars['Float']['output'];
  terrible: Scalars['Int']['output'];
  terriblePercentage: Scalars['Float']['output'];
};

export type ExternalAlbumSearchResult = {
  __typename?: 'ExternalAlbumSearchResult';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  thumbnail: Scalars['String']['output'];
  year?: Maybe<Scalars['Int']['output']>;
};

export type ExternalArtistSearchResult = {
  __typename?: 'ExternalArtistSearchResult';
  albums: Array<ExternalAlbumSearchResult>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type ExternalTrackSearchResult = {
  __typename?: 'ExternalTrackSearchResult';
  discNumber: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  trackNumber: Scalars['Int']['output'];
};

export type Item = {
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  score?: Maybe<Scalars['Float']['output']>;
};

export enum ItemType {
  Music = 'MUSIC'
}

export type Mutation = {
  __typename?: 'Mutation';
  CreateAlbum?: Maybe<Album>;
  CreateArtist?: Maybe<Artist>;
  DeleteAlbum?: Maybe<Scalars['Boolean']['output']>;
  DeleteSong?: Maybe<Scalars['Boolean']['output']>;
  UpdateSong?: Maybe<Song>;
};


export type MutationCreateAlbumArgs = {
  album?: InputMaybe<NewAlbumInput>;
};


export type MutationCreateArtistArgs = {
  artist?: InputMaybe<ArtistInput>;
};


export type MutationDeleteAlbumArgs = {
  albumId: Scalars['String']['input'];
};


export type MutationDeleteSongArgs = {
  songId: Scalars['String']['input'];
};


export type MutationUpdateSongArgs = {
  song?: InputMaybe<SongInput>;
};

export type NewAlbumInput = {
  artistId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  songs?: InputMaybe<Array<NewSongInput>>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type NewSongInput = {
  discNumber?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  number?: InputMaybe<Scalars['Int']['input']>;
  score?: InputMaybe<Scalars['Float']['input']>;
};

export type Page = {
  content?: Maybe<Array<Maybe<Pageable>>>;
  pageNumber: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type Pageable = {
  id: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  artist?: Maybe<Artist>;
  artists: ArtistPage;
  searchExternalAlbumTracks: Array<ExternalTrackSearchResult>;
  searchExternalArtist?: Maybe<ExternalArtistSearchResult>;
};


export type QueryArtistArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchExternalAlbumTracksArgs = {
  albumId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchExternalArtistArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Song = Item & {
  __typename?: 'Song';
  discNumber: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  number: Scalars['Int']['output'];
  score?: Maybe<Scalars['Float']['output']>;
};

export type SongInput = {
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  score?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateAlbumMutationVariables = Exact<{
  albumInput?: InputMaybe<NewAlbumInput>;
}>;


export type CreateAlbumMutation = { __typename?: 'Mutation', CreateAlbum?: { __typename?: 'Album', id: string, name: string, year?: number | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, name: string, number: number, discNumber: number, score?: number | null }> } | null };

export type CreateArtistMutationVariables = Exact<{
  artistInput?: InputMaybe<ArtistInput>;
}>;


export type CreateArtistMutation = { __typename?: 'Mutation', CreateArtist?: { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null } | null };

export type DeleteAlbumMutationVariables = Exact<{
  albumId: Scalars['String']['input'];
}>;


export type DeleteAlbumMutation = { __typename?: 'Mutation', DeleteAlbum?: boolean | null };

export type DeleteSongMutationVariables = Exact<{
  songId: Scalars['String']['input'];
}>;


export type DeleteSongMutation = { __typename?: 'Mutation', DeleteSong?: boolean | null };

export type UpdateSongMutationVariables = Exact<{
  song?: InputMaybe<SongInput>;
}>;


export type UpdateSongMutation = { __typename?: 'Mutation', UpdateSong?: { __typename?: 'Song', id: string, name: string, number: number, discNumber: number, score?: number | null } | null };

export type GetArtistsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetArtistsQuery = { __typename?: 'Query', artists: { __typename?: 'ArtistPage', total: number, pageNumber: number, content: Array<{ __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, albums?: Array<{ __typename?: 'Album', id: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, name: string, number: number, discNumber: number, score?: number | null }> } | null> | null } | null> } };

export type GetTracksForSearchAlbumQueryVariables = Exact<{
  albumId: Scalars['String']['input'];
}>;


export type GetTracksForSearchAlbumQuery = { __typename?: 'Query', searchExternalAlbumTracks: Array<{ __typename?: 'ExternalTrackSearchResult', id: string, name: string, trackNumber: number, discNumber: number }> };

export type SearchByArtistQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchByArtistQuery = { __typename?: 'Query', searchExternalArtist?: { __typename?: 'ExternalArtistSearchResult', name: string, id: string, thumbnail?: string | null, albums: Array<{ __typename?: 'ExternalAlbumSearchResult', id: string, name: string, thumbnail: string, year?: number | null }> } | null };

export type SongFieldsFragment = { __typename?: 'Song', id: string, name: string, number: number, discNumber: number, score?: number | null };

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
        score
        dominantColor
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