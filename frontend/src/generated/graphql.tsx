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

export type Image = {
  __typename?: 'Image';
  width: Scalars['Int'];
  height: Scalars['Int'];
  url: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  artist?: Maybe<Array<SearchResult>>;
  album: QueryResponse;
};


export type QueryArtistArgs = {
  name?: Maybe<Scalars['String']>;
};


export type QueryAlbumArgs = {
  artistId: Scalars['String'];
  pageNumber?: Maybe<Scalars['Int']>;
};

export type QueryResponse = {
  __typename?: 'QueryResponse';
  results?: Maybe<Array<SearchResult>>;
  pageNumber?: Maybe<Scalars['Int']>;
};

export type SearchResult = {
  __typename?: 'SearchResult';
  name: Scalars['String'];
  id: Scalars['String'];
  images: Array<Image>;
};

export type TrackSearchResult = {
  __typename?: 'TrackSearchResult';
  name: Scalars['String'];
  number: Scalars['Int'];
  id: Scalars['String'];
};

export type SearchAlbumsByArtistQueryVariables = Exact<{
  artistId: Scalars['String'];
  pageNumber?: Maybe<Scalars['Int']>;
}>;


export type SearchAlbumsByArtistQuery = (
  { __typename?: 'Query' }
  & { album: (
    { __typename?: 'QueryResponse' }
    & Pick<QueryResponse, 'pageNumber'>
    & { results?: Maybe<Array<(
      { __typename?: 'SearchResult' }
      & Pick<SearchResult, 'id' | 'name'>
      & { images?: Maybe<Array<(
        { __typename?: 'Image' }
        & Pick<Image, 'width' | 'height' | 'url'>
      )>> }
    )>> }
  ) }
);

export type SearchByArtistQueryVariables = Exact<{
  name?: Maybe<Scalars['String']>;
}>;


export type SearchByArtistQuery = (
  { __typename?: 'Query' }
  & { artist?: Maybe<Array<(
    { __typename?: 'SearchResult' }
    & Pick<SearchResult, 'id' | 'name'>
    & { images?: Maybe<Array<(
      { __typename?: 'Image' }
      & Pick<Image, 'width' | 'height' | 'url'>
    )>> }
  )>> }
);


export const SearchAlbumsByArtistDocument = gql`
    query SearchAlbumsByArtist($artistId: String!, $pageNumber: Int) {
  album(artistId: $artistId, pageNumber: $pageNumber) {
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
  artist(name: $name) {
    id
    name
    images {
      width
      height
      url
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