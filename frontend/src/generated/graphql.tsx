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
  artistId: Scalars['String']['output'];
  artistName: Scalars['String']['output'];
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
  albums: Array<Album>;
  dominantColor: Scalars['String']['output'];
  id: Scalars['String']['output'];
  metadata: ArtistMetadata;
  name: Scalars['String']['output'];
  score: Scalars['Float']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type ArtistInput = {
  name: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
};

export type ArtistMetadata = {
  __typename?: 'ArtistMetadata';
  id: Scalars['String']['output'];
  songs: ArtistSongMetadata;
  totalAlbums: Scalars['Int']['output'];
  totalSongs: Scalars['Int']['output'];
};

export type ArtistPage = Page & {
  __typename?: 'ArtistPage';
  content: Array<Artist>;
  pageNumber: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ArtistSongMetadata = {
  __typename?: 'ArtistSongMetadata';
  average: Scalars['Int']['output'];
  bad: Scalars['Int']['output'];
  boring: Scalars['Int']['output'];
  classic: Scalars['Int']['output'];
  decent: Scalars['Int']['output'];
  good: Scalars['Int']['output'];
  great: Scalars['Int']['output'];
  interesting: Scalars['Int']['output'];
  meh: Scalars['Int']['output'];
  offensive: Scalars['Int']['output'];
  ok: Scalars['Int']['output'];
  pleasant: Scalars['Int']['output'];
  poor: Scalars['Int']['output'];
  verygood: Scalars['Int']['output'];
};

export type ComparisonSong = {
  __typename?: 'ComparisonSong';
  albumDominantColor: Scalars['String']['output'];
  albumName: Scalars['String']['output'];
  artistName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  songName: Scalars['String']['output'];
  songScore: Scalars['Float']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
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
  score: Scalars['Float']['output'];
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
  UpdateAlbum?: Maybe<Album>;
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


export type MutationUpdateAlbumArgs = {
  album?: InputMaybe<UpdateAlbumInput>;
};


export type MutationUpdateSongArgs = {
  song?: InputMaybe<SongInput>;
};

export type NewAlbumInput = {
  artist: ArtistInput;
  name: Scalars['String']['input'];
  songs: Array<NewSongInput>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type NewSongInput = {
  discNumber?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  number?: InputMaybe<Scalars['Int']['input']>;
  score?: InputMaybe<Scalars['Float']['input']>;
};

export type Page = {
  content: Array<Pageable>;
  pageNumber: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type Pageable = {
  id: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  albums?: Maybe<Array<Album>>;
  artist?: Maybe<Artist>;
  artists: ArtistPage;
  compareToOtherSongsByOtherArtists: Array<ComparisonSong>;
  compareToOtherSongsBySameArtist: Array<ComparisonSong>;
  searchExternalAlbumTracks: Array<ExternalTrackSearchResult>;
  searchExternalArtist?: Maybe<ExternalArtistSearchResult>;
};


export type QueryAlbumsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryArtistArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCompareToOtherSongsByOtherArtistsArgs = {
  artistId: Scalars['String']['input'];
  songId: Scalars['String']['input'];
};


export type QueryCompareToOtherSongsBySameArtistArgs = {
  albumId: Scalars['String']['input'];
  artistId: Scalars['String']['input'];
  songId: Scalars['String']['input'];
};


export type QuerySearchExternalAlbumTracksArgs = {
  albumId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchExternalArtistArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Song = Item & {
  __typename?: 'Song';
  albumId: Scalars['String']['output'];
  artistId: Scalars['String']['output'];
  discNumber: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  number: Scalars['Int']['output'];
  score: Scalars['Float']['output'];
};

export type SongInput = {
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  score?: InputMaybe<Scalars['Float']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  albumUpdated?: Maybe<Album>;
  artistUpdated?: Maybe<Artist>;
};

export type UpdateAlbumInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type AlbumFieldsFragment = { __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number }> };

export type ArtistFieldsFragment = { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number }> }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } };

export type ArtistMetadataFieldsFragment = { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } };

export type SongFieldsFragment = { __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number };

export type ArtistSongMetadataFieldsFragment = { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number };

export type CreateAlbumMutationVariables = Exact<{
  albumInput?: InputMaybe<NewAlbumInput>;
}>;


export type CreateAlbumMutation = { __typename?: 'Mutation', CreateAlbum?: { __typename?: 'Album', id: string, name: string, year?: number | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number }> } | null };

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


export type UpdateSongMutation = { __typename?: 'Mutation', UpdateSong?: { __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number } | null };

export type GetAlbumsQueryVariables = Exact<{
  ids: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetAlbumsQuery = { __typename?: 'Query', albums?: Array<{ __typename?: 'Album', id: string, artistId: string, artistName: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null }> | null };

export type GetAlbumsSongsQueryVariables = Exact<{
  albumIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetAlbumsSongsQuery = { __typename?: 'Query', albums?: Array<{ __typename?: 'Album', id: string, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number }> }> | null };

export type GetArtistAlbumsQueryVariables = Exact<{
  artistName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetArtistAlbumsQuery = { __typename?: 'Query', artist?: { __typename?: 'Artist', id: string, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number }> }> } | null };

export type GetArtistFullQueryVariables = Exact<{
  artistName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetArtistFullQuery = { __typename?: 'Query', artist?: { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score: number }> }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } } | null };

export type GetArtistsPageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetArtistsPageQuery = { __typename?: 'Query', artists: { __typename?: 'ArtistPage', total: number, pageNumber: number, content: Array<{ __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, albums: Array<{ __typename?: 'Album', id: string }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } }> } };

export type GetTracksForSearchAlbumQueryVariables = Exact<{
  albumId: Scalars['String']['input'];
}>;


export type GetTracksForSearchAlbumQuery = { __typename?: 'Query', searchExternalAlbumTracks: Array<{ __typename?: 'ExternalTrackSearchResult', id: string, name: string, trackNumber: number, discNumber: number }> };

export type SearchExternalArtistQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchExternalArtistQuery = { __typename?: 'Query', searchExternalArtist?: { __typename?: 'ExternalArtistSearchResult', name: string, id: string, thumbnail?: string | null, albums: Array<{ __typename?: 'ExternalAlbumSearchResult', id: string, name: string, thumbnail: string, year?: number | null }> } | null };

export type CompareSongToOthersSameArtistQueryVariables = Exact<{
  songId: Scalars['String']['input'];
  albumId: Scalars['String']['input'];
  artistId: Scalars['String']['input'];
}>;


export type CompareSongToOthersSameArtistQuery = { __typename?: 'Query', compareToOtherSongsBySameArtist: Array<{ __typename?: 'ComparisonSong', id: string, songName: string, songScore: number, albumName: string, albumDominantColor: string, artistName: string, thumbnail?: string | null }> };

export type CompareSongToOtherSongsByOtherArtistsQueryVariables = Exact<{
  songId: Scalars['String']['input'];
  artistId: Scalars['String']['input'];
}>;


export type CompareSongToOtherSongsByOtherArtistsQuery = { __typename?: 'Query', compareToOtherSongsByOtherArtists: Array<{ __typename?: 'ComparisonSong', id: string, songName: string, songScore: number, albumName: string, albumDominantColor: string, artistName: string, thumbnail?: string | null }> };

export type OnAlbumUpdateSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnAlbumUpdateSubscription = { __typename?: 'Subscription', albumUpdated?: { __typename?: 'Album', id: string, score?: number | null } | null };

export type OnArtistUpdateSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnArtistUpdateSubscription = { __typename?: 'Subscription', artistUpdated?: { __typename?: 'Artist', id: string, score: number, metadata: { __typename?: 'ArtistMetadata', totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } } | null };

export const SongFieldsFragmentDoc = gql`
    fragment SongFields on Song {
  id
  albumId
  artistId
  name
  number
  discNumber
  score
}
    `;
export const AlbumFieldsFragmentDoc = gql`
    fragment AlbumFields on Album {
  id
  artistId
  name
  year
  score
  dominantColor
  thumbnail
  songs {
    ...SongFields
  }
}
    ${SongFieldsFragmentDoc}`;
export const ArtistSongMetadataFieldsFragmentDoc = gql`
    fragment ArtistSongMetadataFields on ArtistSongMetadata {
  classic
  great
  verygood
  good
  pleasant
  decent
  interesting
  ok
  meh
  average
  boring
  poor
  bad
  offensive
}
    `;
export const ArtistMetadataFieldsFragmentDoc = gql`
    fragment ArtistMetadataFields on ArtistMetadata {
  id
  totalSongs
  totalAlbums
  songs {
    ...ArtistSongMetadataFields
  }
}
    ${ArtistSongMetadataFieldsFragmentDoc}`;
export const ArtistFieldsFragmentDoc = gql`
    fragment ArtistFields on Artist {
  id
  name
  thumbnail
  dominantColor
  score
  albums {
    ...AlbumFields
  }
  metadata {
    ...ArtistMetadataFields
  }
}
    ${AlbumFieldsFragmentDoc}
${ArtistMetadataFieldsFragmentDoc}`;
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
export const GetAlbumsDocument = gql`
    query GetAlbums($ids: [String!]!) {
  albums(ids: $ids) {
    id
    artistId
    artistName
    name
    year
    score
    dominantColor
    thumbnail
  }
}
    `;

/**
 * __useGetAlbumsQuery__
 *
 * To run a query within a React component, call `useGetAlbumsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAlbumsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAlbumsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useGetAlbumsQuery(baseOptions: Apollo.QueryHookOptions<GetAlbumsQuery, GetAlbumsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAlbumsQuery, GetAlbumsQueryVariables>(GetAlbumsDocument, options);
      }
export function useGetAlbumsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAlbumsQuery, GetAlbumsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAlbumsQuery, GetAlbumsQueryVariables>(GetAlbumsDocument, options);
        }
export type GetAlbumsQueryHookResult = ReturnType<typeof useGetAlbumsQuery>;
export type GetAlbumsLazyQueryHookResult = ReturnType<typeof useGetAlbumsLazyQuery>;
export type GetAlbumsQueryResult = Apollo.QueryResult<GetAlbumsQuery, GetAlbumsQueryVariables>;
export const GetAlbumsSongsDocument = gql`
    query GetAlbumsSongs($albumIds: [String!]!) {
  albums(ids: $albumIds) {
    id
    songs {
      ...SongFields
    }
  }
}
    ${SongFieldsFragmentDoc}`;

/**
 * __useGetAlbumsSongsQuery__
 *
 * To run a query within a React component, call `useGetAlbumsSongsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAlbumsSongsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAlbumsSongsQuery({
 *   variables: {
 *      albumIds: // value for 'albumIds'
 *   },
 * });
 */
export function useGetAlbumsSongsQuery(baseOptions: Apollo.QueryHookOptions<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>(GetAlbumsSongsDocument, options);
      }
export function useGetAlbumsSongsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>(GetAlbumsSongsDocument, options);
        }
export type GetAlbumsSongsQueryHookResult = ReturnType<typeof useGetAlbumsSongsQuery>;
export type GetAlbumsSongsLazyQueryHookResult = ReturnType<typeof useGetAlbumsSongsLazyQuery>;
export type GetAlbumsSongsQueryResult = Apollo.QueryResult<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>;
export const GetArtistAlbumsDocument = gql`
    query GetArtistAlbums($artistName: String) {
  artist(name: $artistName) {
    id
    albums {
      ...AlbumFields
    }
  }
}
    ${AlbumFieldsFragmentDoc}`;

/**
 * __useGetArtistAlbumsQuery__
 *
 * To run a query within a React component, call `useGetArtistAlbumsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArtistAlbumsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArtistAlbumsQuery({
 *   variables: {
 *      artistName: // value for 'artistName'
 *   },
 * });
 */
export function useGetArtistAlbumsQuery(baseOptions?: Apollo.QueryHookOptions<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>(GetArtistAlbumsDocument, options);
      }
export function useGetArtistAlbumsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>(GetArtistAlbumsDocument, options);
        }
export type GetArtistAlbumsQueryHookResult = ReturnType<typeof useGetArtistAlbumsQuery>;
export type GetArtistAlbumsLazyQueryHookResult = ReturnType<typeof useGetArtistAlbumsLazyQuery>;
export type GetArtistAlbumsQueryResult = Apollo.QueryResult<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>;
export const GetArtistFullDocument = gql`
    query GetArtistFull($artistName: String) {
  artist(name: $artistName) {
    ...ArtistFields
  }
}
    ${ArtistFieldsFragmentDoc}`;

/**
 * __useGetArtistFullQuery__
 *
 * To run a query within a React component, call `useGetArtistFullQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArtistFullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArtistFullQuery({
 *   variables: {
 *      artistName: // value for 'artistName'
 *   },
 * });
 */
export function useGetArtistFullQuery(baseOptions?: Apollo.QueryHookOptions<GetArtistFullQuery, GetArtistFullQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArtistFullQuery, GetArtistFullQueryVariables>(GetArtistFullDocument, options);
      }
export function useGetArtistFullLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArtistFullQuery, GetArtistFullQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArtistFullQuery, GetArtistFullQueryVariables>(GetArtistFullDocument, options);
        }
export type GetArtistFullQueryHookResult = ReturnType<typeof useGetArtistFullQuery>;
export type GetArtistFullLazyQueryHookResult = ReturnType<typeof useGetArtistFullLazyQuery>;
export type GetArtistFullQueryResult = Apollo.QueryResult<GetArtistFullQuery, GetArtistFullQueryVariables>;
export const GetArtistsPageDocument = gql`
    query GetArtistsPage {
  artists {
    total
    pageNumber
    content {
      id
      name
      thumbnail
      dominantColor
      score
      albums {
        id
      }
      metadata {
        ...ArtistMetadataFields
      }
    }
  }
}
    ${ArtistMetadataFieldsFragmentDoc}`;

/**
 * __useGetArtistsPageQuery__
 *
 * To run a query within a React component, call `useGetArtistsPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArtistsPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArtistsPageQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetArtistsPageQuery(baseOptions?: Apollo.QueryHookOptions<GetArtistsPageQuery, GetArtistsPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArtistsPageQuery, GetArtistsPageQueryVariables>(GetArtistsPageDocument, options);
      }
export function useGetArtistsPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArtistsPageQuery, GetArtistsPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArtistsPageQuery, GetArtistsPageQueryVariables>(GetArtistsPageDocument, options);
        }
export type GetArtistsPageQueryHookResult = ReturnType<typeof useGetArtistsPageQuery>;
export type GetArtistsPageLazyQueryHookResult = ReturnType<typeof useGetArtistsPageLazyQuery>;
export type GetArtistsPageQueryResult = Apollo.QueryResult<GetArtistsPageQuery, GetArtistsPageQueryVariables>;
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
export const SearchExternalArtistDocument = gql`
    query SearchExternalArtist($name: String) {
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
 * __useSearchExternalArtistQuery__
 *
 * To run a query within a React component, call `useSearchExternalArtistQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchExternalArtistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchExternalArtistQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSearchExternalArtistQuery(baseOptions?: Apollo.QueryHookOptions<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>(SearchExternalArtistDocument, options);
      }
export function useSearchExternalArtistLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>(SearchExternalArtistDocument, options);
        }
export type SearchExternalArtistQueryHookResult = ReturnType<typeof useSearchExternalArtistQuery>;
export type SearchExternalArtistLazyQueryHookResult = ReturnType<typeof useSearchExternalArtistLazyQuery>;
export type SearchExternalArtistQueryResult = Apollo.QueryResult<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>;
export const CompareSongToOthersSameArtistDocument = gql`
    query CompareSongToOthersSameArtist($songId: String!, $albumId: String!, $artistId: String!) {
  compareToOtherSongsBySameArtist(
    songId: $songId
    albumId: $albumId
    artistId: $artistId
  ) {
    id
    songName
    songScore
    albumName
    albumDominantColor
    artistName
    thumbnail
  }
}
    `;

/**
 * __useCompareSongToOthersSameArtistQuery__
 *
 * To run a query within a React component, call `useCompareSongToOthersSameArtistQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompareSongToOthersSameArtistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompareSongToOthersSameArtistQuery({
 *   variables: {
 *      songId: // value for 'songId'
 *      albumId: // value for 'albumId'
 *      artistId: // value for 'artistId'
 *   },
 * });
 */
export function useCompareSongToOthersSameArtistQuery(baseOptions: Apollo.QueryHookOptions<CompareSongToOthersSameArtistQuery, CompareSongToOthersSameArtistQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CompareSongToOthersSameArtistQuery, CompareSongToOthersSameArtistQueryVariables>(CompareSongToOthersSameArtistDocument, options);
      }
export function useCompareSongToOthersSameArtistLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompareSongToOthersSameArtistQuery, CompareSongToOthersSameArtistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CompareSongToOthersSameArtistQuery, CompareSongToOthersSameArtistQueryVariables>(CompareSongToOthersSameArtistDocument, options);
        }
export type CompareSongToOthersSameArtistQueryHookResult = ReturnType<typeof useCompareSongToOthersSameArtistQuery>;
export type CompareSongToOthersSameArtistLazyQueryHookResult = ReturnType<typeof useCompareSongToOthersSameArtistLazyQuery>;
export type CompareSongToOthersSameArtistQueryResult = Apollo.QueryResult<CompareSongToOthersSameArtistQuery, CompareSongToOthersSameArtistQueryVariables>;
export const CompareSongToOtherSongsByOtherArtistsDocument = gql`
    query CompareSongToOtherSongsByOtherArtists($songId: String!, $artistId: String!) {
  compareToOtherSongsByOtherArtists(songId: $songId, artistId: $artistId) {
    id
    songName
    songScore
    albumName
    albumDominantColor
    artistName
    thumbnail
  }
}
    `;

/**
 * __useCompareSongToOtherSongsByOtherArtistsQuery__
 *
 * To run a query within a React component, call `useCompareSongToOtherSongsByOtherArtistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompareSongToOtherSongsByOtherArtistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompareSongToOtherSongsByOtherArtistsQuery({
 *   variables: {
 *      songId: // value for 'songId'
 *      artistId: // value for 'artistId'
 *   },
 * });
 */
export function useCompareSongToOtherSongsByOtherArtistsQuery(baseOptions: Apollo.QueryHookOptions<CompareSongToOtherSongsByOtherArtistsQuery, CompareSongToOtherSongsByOtherArtistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CompareSongToOtherSongsByOtherArtistsQuery, CompareSongToOtherSongsByOtherArtistsQueryVariables>(CompareSongToOtherSongsByOtherArtistsDocument, options);
      }
export function useCompareSongToOtherSongsByOtherArtistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompareSongToOtherSongsByOtherArtistsQuery, CompareSongToOtherSongsByOtherArtistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CompareSongToOtherSongsByOtherArtistsQuery, CompareSongToOtherSongsByOtherArtistsQueryVariables>(CompareSongToOtherSongsByOtherArtistsDocument, options);
        }
export type CompareSongToOtherSongsByOtherArtistsQueryHookResult = ReturnType<typeof useCompareSongToOtherSongsByOtherArtistsQuery>;
export type CompareSongToOtherSongsByOtherArtistsLazyQueryHookResult = ReturnType<typeof useCompareSongToOtherSongsByOtherArtistsLazyQuery>;
export type CompareSongToOtherSongsByOtherArtistsQueryResult = Apollo.QueryResult<CompareSongToOtherSongsByOtherArtistsQuery, CompareSongToOtherSongsByOtherArtistsQueryVariables>;
export const OnAlbumUpdateDocument = gql`
    subscription onAlbumUpdate {
  albumUpdated {
    id
    score
  }
}
    `;

/**
 * __useOnAlbumUpdateSubscription__
 *
 * To run a query within a React component, call `useOnAlbumUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnAlbumUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnAlbumUpdateSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnAlbumUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnAlbumUpdateSubscription, OnAlbumUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnAlbumUpdateSubscription, OnAlbumUpdateSubscriptionVariables>(OnAlbumUpdateDocument, options);
      }
export type OnAlbumUpdateSubscriptionHookResult = ReturnType<typeof useOnAlbumUpdateSubscription>;
export type OnAlbumUpdateSubscriptionResult = Apollo.SubscriptionResult<OnAlbumUpdateSubscription>;
export const OnArtistUpdateDocument = gql`
    subscription onArtistUpdate {
  artistUpdated {
    id
    score
    metadata {
      totalSongs
      totalAlbums
      songs {
        ...ArtistSongMetadataFields
      }
    }
  }
}
    ${ArtistSongMetadataFieldsFragmentDoc}`;

/**
 * __useOnArtistUpdateSubscription__
 *
 * To run a query within a React component, call `useOnArtistUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnArtistUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnArtistUpdateSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnArtistUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnArtistUpdateSubscription, OnArtistUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnArtistUpdateSubscription, OnArtistUpdateSubscriptionVariables>(OnArtistUpdateDocument, options);
      }
export type OnArtistUpdateSubscriptionHookResult = ReturnType<typeof useOnArtistUpdateSubscription>;
export type OnArtistUpdateSubscriptionResult = Apollo.SubscriptionResult<OnArtistUpdateSubscription>;