import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
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
  year?: Maybe<Scalars['String']>;
  songs?: Maybe<Array<Maybe<Song>>>;
};

export type AlbumInput = {
  id: Scalars['String'];
  name: Scalars['String'];
  year?: Maybe<Scalars['Int']>;
};

export type AlbumSearchResult = {
  __typename?: 'AlbumSearchResult';
  id: Scalars['String'];
  name: Scalars['String'];
  images: Array<Image>;
  year?: Maybe<Scalars['String']>;
};

export type Artist = {
  __typename?: 'Artist';
  id: Scalars['String'];
  name: Scalars['String'];
  albums?: Maybe<Array<Maybe<Album>>>;
};

export type ArtistInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type Image = {
  __typename?: 'Image';
  width: Scalars['Int'];
  height: Scalars['Int'];
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  CreateSong?: Maybe<Song>;
};


export type MutationCreateSongArgs = {
  song?: Maybe<SongInput>;
};

export type PaginatedAlbumResult = {
  __typename?: 'PaginatedAlbumResult';
  results: Array<AlbumSearchResult>;
  pageNumber: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  search?: Maybe<SearchQuery>;
};

export type SearchQuery = {
  __typename?: 'SearchQuery';
  artists: Array<SearchResult>;
  albums: PaginatedAlbumResult;
  tracks: Array<TrackSearchResult>;
};


export type SearchQueryArtistsArgs = {
  name?: Maybe<Scalars['String']>;
};


export type SearchQueryAlbumsArgs = {
  artistId: Scalars['String'];
  pageNumber?: Maybe<Scalars['Int']>;
};


export type SearchQueryTracksArgs = {
  albumId: Scalars['String'];
};

export type SearchResult = {
  __typename?: 'SearchResult';
  name: Scalars['String'];
  id: Scalars['String'];
  images: Array<Image>;
};

export type Song = {
  __typename?: 'Song';
  id: Scalars['String'];
  score: Scalars['Float'];
  name: Scalars['String'];
  number?: Maybe<Scalars['Int']>;
};

export type SongInput = {
  id: Scalars['String'];
  score: Scalars['Float'];
  name: Scalars['String'];
  trackNumber?: Maybe<Scalars['Int']>;
  album?: Maybe<AlbumInput>;
  artist?: Maybe<ArtistInput>;
};

export type TrackSearchResult = {
  __typename?: 'TrackSearchResult';
  name: Scalars['String'];
  trackNumber: Scalars['Int'];
  discNumber: Scalars['Int'];
  id: Scalars['String'];
};

export type CreateSongMutationVariables = Exact<{
  song?: Maybe<SongInput>;
}>;


export type CreateSongMutation = (
  { __typename?: 'Mutation' }
  & { CreateSong?: Maybe<(
    { __typename?: 'Song' }
    & Pick<Song, 'id' | 'name' | 'score'>
  )> }
);

export type GetTracksForAlbumQueryVariables = Exact<{
  albumId: Scalars['String'];
}>;


export type GetTracksForAlbumQuery = (
  { __typename?: 'Query' }
  & { search?: Maybe<(
    { __typename?: 'SearchQuery' }
    & { tracks: Array<(
      { __typename?: 'TrackSearchResult' }
      & Pick<TrackSearchResult, 'id' | 'name' | 'trackNumber' | 'discNumber'>
    )> }
  )> }
);

export type SearchAlbumsByArtistQueryVariables = Exact<{
  artistId: Scalars['String'];
  pageNumber?: Maybe<Scalars['Int']>;
}>;


export type SearchAlbumsByArtistQuery = (
  { __typename?: 'Query' }
  & { search?: Maybe<(
    { __typename?: 'SearchQuery' }
    & { albums: (
      { __typename?: 'PaginatedAlbumResult' }
      & Pick<PaginatedAlbumResult, 'pageNumber'>
      & { results: Array<(
        { __typename?: 'AlbumSearchResult' }
        & Pick<AlbumSearchResult, 'id' | 'name'>
        & { images: Array<(
          { __typename?: 'Image' }
          & Pick<Image, 'width' | 'height' | 'url'>
        )> }
      )> }
    ) }
  )> }
);

export type SearchByArtistQueryVariables = Exact<{
  name?: Maybe<Scalars['String']>;
}>;


export type SearchByArtistQuery = (
  { __typename?: 'Query' }
  & { search?: Maybe<(
    { __typename?: 'SearchQuery' }
    & { artists: Array<(
      { __typename?: 'SearchResult' }
      & Pick<SearchResult, 'id' | 'name'>
      & { images: Array<(
        { __typename?: 'Image' }
        & Pick<Image, 'width' | 'height' | 'url'>
      )> }
    )> }
  )> }
);


export const CreateSongDocument = gql`
    mutation CreateSong($song: SongInput) {
  CreateSong(song: $song) {
    id
    name
    score
  }
}
    `;
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
export const GetTracksForAlbumDocument = gql`
    query GetTracksForAlbum($albumId: String!) {
  search {
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
export const SearchAlbumsByArtistDocument = gql`
    query SearchAlbumsByArtist($artistId: String!, $pageNumber: Int) {
  search {
    albums(artistId: $artistId, pageNumber: $pageNumber) {
      results {
        id
        name
        images {
          width
          height
          url
        }
      }
      pageNumber
    }
  }
}
    `;

/**
 * __useSearchAlbumsByArtistQuery__
 *
 * To run a query within a React component, call `useSearchAlbumsByArtistQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchAlbumsByArtistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchAlbumsByArtistQuery({
 *   variables: {
 *      artistId: // value for 'artistId'
 *      pageNumber: // value for 'pageNumber'
 *   },
 * });
 */
export function useSearchAlbumsByArtistQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SearchAlbumsByArtistQuery, SearchAlbumsByArtistQueryVariables>) {
        return ApolloReactHooks.useQuery<SearchAlbumsByArtistQuery, SearchAlbumsByArtistQueryVariables>(SearchAlbumsByArtistDocument, baseOptions);
      }
export function useSearchAlbumsByArtistLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SearchAlbumsByArtistQuery, SearchAlbumsByArtistQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<SearchAlbumsByArtistQuery, SearchAlbumsByArtistQueryVariables>(SearchAlbumsByArtistDocument, baseOptions);
        }
export type SearchAlbumsByArtistQueryHookResult = ReturnType<typeof useSearchAlbumsByArtistQuery>;
export type SearchAlbumsByArtistLazyQueryHookResult = ReturnType<typeof useSearchAlbumsByArtistLazyQuery>;
export type SearchAlbumsByArtistQueryResult = ApolloReactCommon.QueryResult<SearchAlbumsByArtistQuery, SearchAlbumsByArtistQueryVariables>;
export const SearchByArtistDocument = gql`
    query SearchByArtist($name: String) {
  search {
    artists(name: $name) {
      id
      name
      images {
        width
        height
        url
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