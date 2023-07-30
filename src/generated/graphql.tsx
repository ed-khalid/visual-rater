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
  albums?: Maybe<Array<Maybe<Album>>>;
  dominantColor?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  metadata?: Maybe<ArtistMetadata>;
  name: Scalars['String']['output'];
  score?: Maybe<Scalars['Float']['output']>;
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
  content?: Maybe<Array<Maybe<Pageable>>>;
  pageNumber: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type Pageable = {
  id: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  albumsWithoutSongs?: Maybe<Array<Album>>;
  artistWithAlbumsAndSongs?: Maybe<Artist>;
  artistsWithoutAlbumsPage: ArtistPage;
  compareToOtherSongsByOtherArtists: Array<ComparisonSong>;
  compareToOtherSongsBySameArtist: Array<ComparisonSong>;
  searchExternalAlbumTracks: Array<ExternalTrackSearchResult>;
  searchExternalArtist?: Maybe<ExternalArtistSearchResult>;
  songs?: Maybe<Array<Maybe<Array<Song>>>>;
};


export type QueryAlbumsWithoutSongsArgs = {
  artistIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryArtistWithAlbumsAndSongsArgs = {
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


export type QuerySongsArgs = {
  albumIds: Array<Scalars['String']['input']>;
};

export type Song = Item & {
  __typename?: 'Song';
  albumId: Scalars['String']['output'];
  artistId: Scalars['String']['output'];
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

export type Subscription = {
  __typename?: 'Subscription';
  artistMetadataUpdated?: Maybe<ArtistMetadata>;
};

export type AlbumFieldsFragment = { __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null }> };

export type ArtistFieldsFragment = { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor?: string | null, score?: number | null, albums?: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null }> } | null> | null, metadata?: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, good: number, mediocre: number, bad: number, terrible: number, classicPercentage: number, greatPercentage: number, goodPercentage: number, mediocrePercentage: number, badPercentage: number, terriblePercentage: number } } | null };

export type ArtistMetadataFieldsFragment = { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, good: number, mediocre: number, bad: number, terrible: number, classicPercentage: number, greatPercentage: number, goodPercentage: number, mediocrePercentage: number, badPercentage: number, terriblePercentage: number } };

export type SongFieldsFragment = { __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null };

export type ArtistSongMetadataFieldsFragment = { __typename?: 'ArtistSongMetadata', classic: number, great: number, good: number, mediocre: number, bad: number, terrible: number, classicPercentage: number, greatPercentage: number, goodPercentage: number, mediocrePercentage: number, badPercentage: number, terriblePercentage: number };

export type CreateAlbumMutationVariables = Exact<{
  albumInput?: InputMaybe<NewAlbumInput>;
}>;


export type CreateAlbumMutation = { __typename?: 'Mutation', CreateAlbum?: { __typename?: 'Album', id: string, name: string, year?: number | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null }> } | null };

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


export type UpdateSongMutation = { __typename?: 'Mutation', UpdateSong?: { __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null } | null };

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

export type AlbumsWithoutSongsQueryVariables = Exact<{
  artistIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type AlbumsWithoutSongsQuery = { __typename?: 'Query', albumsWithoutSongs?: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null }> }> | null };

export type ArtistsWithoutAlbumsPageQueryVariables = Exact<{ [key: string]: never; }>;


export type ArtistsWithoutAlbumsPageQuery = { __typename?: 'Query', artistsWithoutAlbumsPage: { __typename?: 'ArtistPage', total: number, pageNumber: number, content: Array<{ __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor?: string | null, score?: number | null, albums?: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null }> } | null> | null, metadata?: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, good: number, mediocre: number, bad: number, terrible: number, classicPercentage: number, greatPercentage: number, goodPercentage: number, mediocrePercentage: number, badPercentage: number, terriblePercentage: number } } | null } | null> } };

export type ArtistWithAlbumsAndSongsQueryVariables = Exact<{
  artistName?: InputMaybe<Scalars['String']['input']>;
}>;


export type ArtistWithAlbumsAndSongsQuery = { __typename?: 'Query', artistWithAlbumsAndSongs?: { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor?: string | null, score?: number | null, albums?: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null }> } | null> | null, metadata?: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, good: number, mediocre: number, bad: number, terrible: number, classicPercentage: number, greatPercentage: number, goodPercentage: number, mediocrePercentage: number, badPercentage: number, terriblePercentage: number } } | null } | null };

export type AlbumSongsQueryVariables = Exact<{
  albumIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type AlbumSongsQuery = { __typename?: 'Query', songs?: Array<Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null }> | null> | null };

export type GetTracksForSearchAlbumQueryVariables = Exact<{
  albumId: Scalars['String']['input'];
}>;


export type GetTracksForSearchAlbumQuery = { __typename?: 'Query', searchExternalAlbumTracks: Array<{ __typename?: 'ExternalTrackSearchResult', id: string, name: string, trackNumber: number, discNumber: number }> };

export type SearchByArtistQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchByArtistQuery = { __typename?: 'Query', searchExternalArtist?: { __typename?: 'ExternalArtistSearchResult', name: string, id: string, thumbnail?: string | null, albums: Array<{ __typename?: 'ExternalAlbumSearchResult', id: string, name: string, thumbnail: string, year?: number | null }> } | null };

export type OnArtistMetadataUpdateSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnArtistMetadataUpdateSubscription = { __typename?: 'Subscription', artistMetadataUpdated?: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, good: number, mediocre: number, bad: number, terrible: number, classicPercentage: number, greatPercentage: number, goodPercentage: number, mediocrePercentage: number, badPercentage: number, terriblePercentage: number } } | null };

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
  good
  mediocre
  bad
  terrible
  classicPercentage
  greatPercentage
  goodPercentage
  mediocrePercentage
  badPercentage
  terriblePercentage
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
export const AlbumsWithoutSongsDocument = gql`
    query albumsWithoutSongs($artistIds: [String!]) {
  albumsWithoutSongs(artistIds: $artistIds) {
    ...AlbumFields
  }
}
    ${AlbumFieldsFragmentDoc}`;

/**
 * __useAlbumsWithoutSongsQuery__
 *
 * To run a query within a React component, call `useAlbumsWithoutSongsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAlbumsWithoutSongsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAlbumsWithoutSongsQuery({
 *   variables: {
 *      artistIds: // value for 'artistIds'
 *   },
 * });
 */
export function useAlbumsWithoutSongsQuery(baseOptions?: Apollo.QueryHookOptions<AlbumsWithoutSongsQuery, AlbumsWithoutSongsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AlbumsWithoutSongsQuery, AlbumsWithoutSongsQueryVariables>(AlbumsWithoutSongsDocument, options);
      }
export function useAlbumsWithoutSongsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AlbumsWithoutSongsQuery, AlbumsWithoutSongsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AlbumsWithoutSongsQuery, AlbumsWithoutSongsQueryVariables>(AlbumsWithoutSongsDocument, options);
        }
export type AlbumsWithoutSongsQueryHookResult = ReturnType<typeof useAlbumsWithoutSongsQuery>;
export type AlbumsWithoutSongsLazyQueryHookResult = ReturnType<typeof useAlbumsWithoutSongsLazyQuery>;
export type AlbumsWithoutSongsQueryResult = Apollo.QueryResult<AlbumsWithoutSongsQuery, AlbumsWithoutSongsQueryVariables>;
export const ArtistsWithoutAlbumsPageDocument = gql`
    query artistsWithoutAlbumsPage {
  artistsWithoutAlbumsPage {
    total
    pageNumber
    content {
      ...ArtistFields
    }
  }
}
    ${ArtistFieldsFragmentDoc}`;

/**
 * __useArtistsWithoutAlbumsPageQuery__
 *
 * To run a query within a React component, call `useArtistsWithoutAlbumsPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useArtistsWithoutAlbumsPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useArtistsWithoutAlbumsPageQuery({
 *   variables: {
 *   },
 * });
 */
export function useArtistsWithoutAlbumsPageQuery(baseOptions?: Apollo.QueryHookOptions<ArtistsWithoutAlbumsPageQuery, ArtistsWithoutAlbumsPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ArtistsWithoutAlbumsPageQuery, ArtistsWithoutAlbumsPageQueryVariables>(ArtistsWithoutAlbumsPageDocument, options);
      }
export function useArtistsWithoutAlbumsPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ArtistsWithoutAlbumsPageQuery, ArtistsWithoutAlbumsPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ArtistsWithoutAlbumsPageQuery, ArtistsWithoutAlbumsPageQueryVariables>(ArtistsWithoutAlbumsPageDocument, options);
        }
export type ArtistsWithoutAlbumsPageQueryHookResult = ReturnType<typeof useArtistsWithoutAlbumsPageQuery>;
export type ArtistsWithoutAlbumsPageLazyQueryHookResult = ReturnType<typeof useArtistsWithoutAlbumsPageLazyQuery>;
export type ArtistsWithoutAlbumsPageQueryResult = Apollo.QueryResult<ArtistsWithoutAlbumsPageQuery, ArtistsWithoutAlbumsPageQueryVariables>;
export const ArtistWithAlbumsAndSongsDocument = gql`
    query artistWithAlbumsAndSongs($artistName: String) {
  artistWithAlbumsAndSongs(name: $artistName) {
    ...ArtistFields
  }
}
    ${ArtistFieldsFragmentDoc}`;

/**
 * __useArtistWithAlbumsAndSongsQuery__
 *
 * To run a query within a React component, call `useArtistWithAlbumsAndSongsQuery` and pass it any options that fit your needs.
 * When your component renders, `useArtistWithAlbumsAndSongsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useArtistWithAlbumsAndSongsQuery({
 *   variables: {
 *      artistName: // value for 'artistName'
 *   },
 * });
 */
export function useArtistWithAlbumsAndSongsQuery(baseOptions?: Apollo.QueryHookOptions<ArtistWithAlbumsAndSongsQuery, ArtistWithAlbumsAndSongsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ArtistWithAlbumsAndSongsQuery, ArtistWithAlbumsAndSongsQueryVariables>(ArtistWithAlbumsAndSongsDocument, options);
      }
export function useArtistWithAlbumsAndSongsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ArtistWithAlbumsAndSongsQuery, ArtistWithAlbumsAndSongsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ArtistWithAlbumsAndSongsQuery, ArtistWithAlbumsAndSongsQueryVariables>(ArtistWithAlbumsAndSongsDocument, options);
        }
export type ArtistWithAlbumsAndSongsQueryHookResult = ReturnType<typeof useArtistWithAlbumsAndSongsQuery>;
export type ArtistWithAlbumsAndSongsLazyQueryHookResult = ReturnType<typeof useArtistWithAlbumsAndSongsLazyQuery>;
export type ArtistWithAlbumsAndSongsQueryResult = Apollo.QueryResult<ArtistWithAlbumsAndSongsQuery, ArtistWithAlbumsAndSongsQueryVariables>;
export const AlbumSongsDocument = gql`
    query albumSongs($albumIds: [String!]!) {
  songs(albumIds: $albumIds) {
    ...SongFields
  }
}
    ${SongFieldsFragmentDoc}`;

/**
 * __useAlbumSongsQuery__
 *
 * To run a query within a React component, call `useAlbumSongsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAlbumSongsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAlbumSongsQuery({
 *   variables: {
 *      albumIds: // value for 'albumIds'
 *   },
 * });
 */
export function useAlbumSongsQuery(baseOptions: Apollo.QueryHookOptions<AlbumSongsQuery, AlbumSongsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AlbumSongsQuery, AlbumSongsQueryVariables>(AlbumSongsDocument, options);
      }
export function useAlbumSongsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AlbumSongsQuery, AlbumSongsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AlbumSongsQuery, AlbumSongsQueryVariables>(AlbumSongsDocument, options);
        }
export type AlbumSongsQueryHookResult = ReturnType<typeof useAlbumSongsQuery>;
export type AlbumSongsLazyQueryHookResult = ReturnType<typeof useAlbumSongsLazyQuery>;
export type AlbumSongsQueryResult = Apollo.QueryResult<AlbumSongsQuery, AlbumSongsQueryVariables>;
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
export const OnArtistMetadataUpdateDocument = gql`
    subscription onArtistMetadataUpdate {
  artistMetadataUpdated {
    id
    totalSongs
    totalAlbums
    songs {
      classic
      great
      good
      mediocre
      bad
      terrible
      classicPercentage
      greatPercentage
      goodPercentage
      mediocrePercentage
      badPercentage
      terriblePercentage
    }
  }
}
    `;

/**
 * __useOnArtistMetadataUpdateSubscription__
 *
 * To run a query within a React component, call `useOnArtistMetadataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnArtistMetadataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnArtistMetadataUpdateSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnArtistMetadataUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnArtistMetadataUpdateSubscription, OnArtistMetadataUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnArtistMetadataUpdateSubscription, OnArtistMetadataUpdateSubscriptionVariables>(OnArtistMetadataUpdateDocument, options);
      }
export type OnArtistMetadataUpdateSubscriptionHookResult = ReturnType<typeof useOnArtistMetadataUpdateSubscription>;
export type OnArtistMetadataUpdateSubscriptionResult = Apollo.SubscriptionResult<OnArtistMetadataUpdateSubscription>;