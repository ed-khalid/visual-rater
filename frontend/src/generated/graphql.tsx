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
  dominantColor?: Maybe<Scalars['String']['output']>;
  genres?: Maybe<Genres>;
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
  genres?: Maybe<Genres>;
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

export type ArtistSearchParams = {
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
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

export type ExternalAlbumInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type ExternalAlbumSearchResult = {
  __typename?: 'ExternalAlbumSearchResult';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  thumbnail: Scalars['String']['output'];
  year?: Maybe<Scalars['Int']['output']>;
};

export type ExternalArtistInput = {
  albums: Array<ExternalAlbumInput>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
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

export type ExternalTracksSearchResponse = {
  __typename?: 'ExternalTracksSearchResponse';
  albumId: Scalars['String']['output'];
  tracks: Array<ExternalTrackSearchResult>;
};

export type Genre = {
  __typename?: 'Genre';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Genres = {
  __typename?: 'Genres';
  primary: Genre;
  secondary: Array<Genre>;
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
  DeleteAlbum: Scalars['Boolean']['output'];
  DeleteSong: Scalars['Boolean']['output'];
  UpdateSong: Song;
  createAlbumsForExternalArtist: Artist;
  updateAlbum: Album;
  updateArtist: Artist;
};


export type MutationDeleteAlbumArgs = {
  albumId: Scalars['String']['input'];
};


export type MutationDeleteSongArgs = {
  songId: Scalars['String']['input'];
};


export type MutationUpdateSongArgs = {
  song: SongInput;
};


export type MutationCreateAlbumsForExternalArtistArgs = {
  externalArtist: ExternalArtistInput;
};


export type MutationUpdateAlbumArgs = {
  album: UpdateAlbumInput;
};


export type MutationUpdateArtistArgs = {
  artist: UpdateArtistInput;
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
  artist: Artist;
  artists: ArtistPage;
  compareToOtherSongsByOtherArtists: Array<ComparisonSong>;
  compareToOtherSongsBySameArtist: Array<ComparisonSong>;
  genres: Array<Genre>;
  searchExternalArtist: ExternalArtistSearchResult;
  unratedAlbums: Array<UnratedAlbum>;
};


export type QueryAlbumsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryArtistArgs = {
  params: ArtistSearchParams;
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


export type QuerySearchExternalArtistArgs = {
  name: Scalars['String']['input'];
};

export type Song = Item & {
  __typename?: 'Song';
  albumId: Scalars['String']['output'];
  artistId: Scalars['String']['output'];
  discNumber: Scalars['Int']['output'];
  genres: Genres;
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
  albumUpdated?: Maybe<Album>;
  artistUpdated?: Maybe<Artist>;
};

export type UnratedAlbum = Item & {
  __typename?: 'UnratedAlbum';
  artist: Artist;
  artistId: Scalars['String']['output'];
  dominantColor?: Maybe<Scalars['String']['output']>;
  genres: Genres;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  score?: Maybe<Scalars['Float']['output']>;
  songs: Array<Song>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type UpdateAlbumInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type UpdateArtistInput = {
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};

export type AlbumFieldsFragment = { __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> };

export type ArtistFieldsFragment = { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } };

export type ArtistMetadataFieldsFragment = { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } };

export type GenreFieldsFragment = { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> };

export type SongFieldsFragment = { __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } };

export type ArtistSongMetadataFieldsFragment = { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number };

export type CreateAlbumForExternalArtistMutationVariables = Exact<{
  externalArtist: ExternalArtistInput;
}>;


export type CreateAlbumForExternalArtistMutation = { __typename?: 'Mutation', createAlbumsForExternalArtist: { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } } };

export type DeleteAlbumMutationVariables = Exact<{
  albumId: Scalars['String']['input'];
}>;


export type DeleteAlbumMutation = { __typename?: 'Mutation', DeleteAlbum: boolean };

export type DeleteSongMutationVariables = Exact<{
  songId: Scalars['String']['input'];
}>;


export type DeleteSongMutation = { __typename?: 'Mutation', DeleteSong: boolean };

export type UpdateAlbumMutationVariables = Exact<{
  album: UpdateAlbumInput;
}>;


export type UpdateAlbumMutation = { __typename?: 'Mutation', updateAlbum: { __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> } };

export type UpdateArtistMutationVariables = Exact<{
  artist: UpdateArtistInput;
}>;


export type UpdateArtistMutation = { __typename?: 'Mutation', updateArtist: { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } } };

export type UpdateSongMutationVariables = Exact<{
  song: SongInput;
}>;


export type UpdateSongMutation = { __typename?: 'Mutation', UpdateSong: { __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } } };

export type GetAlbumsQueryVariables = Exact<{
  ids: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetAlbumsQuery = { __typename?: 'Query', albums?: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null }> | null };

export type GetAlbumsSongsQueryVariables = Exact<{
  albumIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetAlbumsSongsQuery = { __typename?: 'Query', albums?: Array<{ __typename?: 'Album', id: string, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> }> | null };

export type GetArtistAlbumsQueryVariables = Exact<{
  artistId: Scalars['String']['input'];
}>;


export type GetArtistAlbumsQuery = { __typename?: 'Query', artist: { __typename?: 'Artist', id: string, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> }> } };

export type GetArtistFullQueryVariables = Exact<{
  artistName?: InputMaybe<Scalars['String']['input']>;
  artistId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetArtistFullQuery = { __typename?: 'Query', artist: { __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, albums: Array<{ __typename?: 'Album', id: string, artistId: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, genres?: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } | null, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } } };

export type GetArtistsPageQueryVariables = Exact<{ [key: string]: never; }>;


export type GetArtistsPageQuery = { __typename?: 'Query', artists: { __typename?: 'ArtistPage', total: number, pageNumber: number, content: Array<{ __typename?: 'Artist', id: string, name: string, thumbnail?: string | null, dominantColor: string, score: number, albums: Array<{ __typename?: 'Album', id: string }>, metadata: { __typename?: 'ArtistMetadata', id: string, totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } }> } };

export type GetUnratedAlbumsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnratedAlbumsQuery = { __typename?: 'Query', unratedAlbums: Array<{ __typename?: 'UnratedAlbum', id: string, name: string, year?: number | null, score?: number | null, dominantColor?: string | null, thumbnail?: string | null, artist: { __typename?: 'Artist', id: string, name: string }, songs: Array<{ __typename?: 'Song', id: string, albumId: string, artistId: string, name: string, number: number, discNumber: number, score?: number | null, genres: { __typename?: 'Genres', primary: { __typename?: 'Genre', id: number, name: string }, secondary: Array<{ __typename?: 'Genre', id: number, name: string }> } }> }> };

export type SearchExternalArtistQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type SearchExternalArtistQuery = { __typename?: 'Query', searchExternalArtist: { __typename?: 'ExternalArtistSearchResult', name: string, id: string, thumbnail?: string | null, albums: Array<{ __typename?: 'ExternalAlbumSearchResult', id: string, name: string, thumbnail: string, year?: number | null }> } };

export type OnAlbumUpdateSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnAlbumUpdateSubscription = { __typename?: 'Subscription', albumUpdated?: { __typename?: 'Album', id: string, score?: number | null } | null };

export type OnArtistUpdateSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnArtistUpdateSubscription = { __typename?: 'Subscription', artistUpdated?: { __typename?: 'Artist', id: string, score: number, metadata: { __typename?: 'ArtistMetadata', totalSongs: number, totalAlbums: number, songs: { __typename?: 'ArtistSongMetadata', classic: number, great: number, verygood: number, good: number, pleasant: number, decent: number, interesting: number, ok: number, meh: number, average: number, boring: number, poor: number, bad: number, offensive: number } } } | null };

export const GenreFieldsFragmentDoc = gql`
    fragment GenreFields on Genres {
  primary {
    id
    name
  }
  secondary {
    id
    name
  }
}
    `;
export const SongFieldsFragmentDoc = gql`
    fragment SongFields on Song {
  id
  albumId
  artistId
  name
  number
  discNumber
  score
  genres {
    ...GenreFields
  }
}
    ${GenreFieldsFragmentDoc}`;
export const AlbumFieldsFragmentDoc = gql`
    fragment AlbumFields on Album {
  id
  artistId
  name
  year
  score
  dominantColor
  thumbnail
  genres {
    ...GenreFields
  }
  songs {
    ...SongFields
  }
}
    ${GenreFieldsFragmentDoc}
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
  genres {
    ...GenreFields
  }
  albums {
    ...AlbumFields
  }
  metadata {
    ...ArtistMetadataFields
  }
}
    ${GenreFieldsFragmentDoc}
${AlbumFieldsFragmentDoc}
${ArtistMetadataFieldsFragmentDoc}`;
export const CreateAlbumForExternalArtistDocument = gql`
    mutation CreateAlbumForExternalArtist($externalArtist: ExternalArtistInput!) {
  createAlbumsForExternalArtist(externalArtist: $externalArtist) {
    ...ArtistFields
  }
}
    ${ArtistFieldsFragmentDoc}`;
export type CreateAlbumForExternalArtistMutationFn = Apollo.MutationFunction<CreateAlbumForExternalArtistMutation, CreateAlbumForExternalArtistMutationVariables>;

/**
 * __useCreateAlbumForExternalArtistMutation__
 *
 * To run a mutation, you first call `useCreateAlbumForExternalArtistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAlbumForExternalArtistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAlbumForExternalArtistMutation, { data, loading, error }] = useCreateAlbumForExternalArtistMutation({
 *   variables: {
 *      externalArtist: // value for 'externalArtist'
 *   },
 * });
 */
export function useCreateAlbumForExternalArtistMutation(baseOptions?: Apollo.MutationHookOptions<CreateAlbumForExternalArtistMutation, CreateAlbumForExternalArtistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAlbumForExternalArtistMutation, CreateAlbumForExternalArtistMutationVariables>(CreateAlbumForExternalArtistDocument, options);
      }
export type CreateAlbumForExternalArtistMutationHookResult = ReturnType<typeof useCreateAlbumForExternalArtistMutation>;
export type CreateAlbumForExternalArtistMutationResult = Apollo.MutationResult<CreateAlbumForExternalArtistMutation>;
export type CreateAlbumForExternalArtistMutationOptions = Apollo.BaseMutationOptions<CreateAlbumForExternalArtistMutation, CreateAlbumForExternalArtistMutationVariables>;
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
export const UpdateAlbumDocument = gql`
    mutation updateAlbum($album: UpdateAlbumInput!) {
  updateAlbum(album: $album) {
    ...AlbumFields
  }
}
    ${AlbumFieldsFragmentDoc}`;
export type UpdateAlbumMutationFn = Apollo.MutationFunction<UpdateAlbumMutation, UpdateAlbumMutationVariables>;

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
 *      album: // value for 'album'
 *   },
 * });
 */
export function useUpdateAlbumMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAlbumMutation, UpdateAlbumMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAlbumMutation, UpdateAlbumMutationVariables>(UpdateAlbumDocument, options);
      }
export type UpdateAlbumMutationHookResult = ReturnType<typeof useUpdateAlbumMutation>;
export type UpdateAlbumMutationResult = Apollo.MutationResult<UpdateAlbumMutation>;
export type UpdateAlbumMutationOptions = Apollo.BaseMutationOptions<UpdateAlbumMutation, UpdateAlbumMutationVariables>;
export const UpdateArtistDocument = gql`
    mutation updateArtist($artist: UpdateArtistInput!) {
  updateArtist(artist: $artist) {
    ...ArtistFields
  }
}
    ${ArtistFieldsFragmentDoc}`;
export type UpdateArtistMutationFn = Apollo.MutationFunction<UpdateArtistMutation, UpdateArtistMutationVariables>;

/**
 * __useUpdateArtistMutation__
 *
 * To run a mutation, you first call `useUpdateArtistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateArtistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateArtistMutation, { data, loading, error }] = useUpdateArtistMutation({
 *   variables: {
 *      artist: // value for 'artist'
 *   },
 * });
 */
export function useUpdateArtistMutation(baseOptions?: Apollo.MutationHookOptions<UpdateArtistMutation, UpdateArtistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateArtistMutation, UpdateArtistMutationVariables>(UpdateArtistDocument, options);
      }
export type UpdateArtistMutationHookResult = ReturnType<typeof useUpdateArtistMutation>;
export type UpdateArtistMutationResult = Apollo.MutationResult<UpdateArtistMutation>;
export type UpdateArtistMutationOptions = Apollo.BaseMutationOptions<UpdateArtistMutation, UpdateArtistMutationVariables>;
export const UpdateSongDocument = gql`
    mutation UpdateSong($song: SongInput!) {
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
    name
    year
    score
    dominantColor
    thumbnail
    genres {
      primary {
        id
        name
      }
      secondary {
        id
        name
      }
    }
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
export function useGetAlbumsQuery(baseOptions: Apollo.QueryHookOptions<GetAlbumsQuery, GetAlbumsQueryVariables> & ({ variables: GetAlbumsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAlbumsQuery, GetAlbumsQueryVariables>(GetAlbumsDocument, options);
      }
export function useGetAlbumsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAlbumsQuery, GetAlbumsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAlbumsQuery, GetAlbumsQueryVariables>(GetAlbumsDocument, options);
        }
export function useGetAlbumsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAlbumsQuery, GetAlbumsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAlbumsQuery, GetAlbumsQueryVariables>(GetAlbumsDocument, options);
        }
export type GetAlbumsQueryHookResult = ReturnType<typeof useGetAlbumsQuery>;
export type GetAlbumsLazyQueryHookResult = ReturnType<typeof useGetAlbumsLazyQuery>;
export type GetAlbumsSuspenseQueryHookResult = ReturnType<typeof useGetAlbumsSuspenseQuery>;
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
export function useGetAlbumsSongsQuery(baseOptions: Apollo.QueryHookOptions<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables> & ({ variables: GetAlbumsSongsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>(GetAlbumsSongsDocument, options);
      }
export function useGetAlbumsSongsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>(GetAlbumsSongsDocument, options);
        }
export function useGetAlbumsSongsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>(GetAlbumsSongsDocument, options);
        }
export type GetAlbumsSongsQueryHookResult = ReturnType<typeof useGetAlbumsSongsQuery>;
export type GetAlbumsSongsLazyQueryHookResult = ReturnType<typeof useGetAlbumsSongsLazyQuery>;
export type GetAlbumsSongsSuspenseQueryHookResult = ReturnType<typeof useGetAlbumsSongsSuspenseQuery>;
export type GetAlbumsSongsQueryResult = Apollo.QueryResult<GetAlbumsSongsQuery, GetAlbumsSongsQueryVariables>;
export const GetArtistAlbumsDocument = gql`
    query GetArtistAlbums($artistId: String!) {
  artist(params: {id: $artistId}) {
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
 *      artistId: // value for 'artistId'
 *   },
 * });
 */
export function useGetArtistAlbumsQuery(baseOptions: Apollo.QueryHookOptions<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables> & ({ variables: GetArtistAlbumsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>(GetArtistAlbumsDocument, options);
      }
export function useGetArtistAlbumsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>(GetArtistAlbumsDocument, options);
        }
export function useGetArtistAlbumsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>(GetArtistAlbumsDocument, options);
        }
export type GetArtistAlbumsQueryHookResult = ReturnType<typeof useGetArtistAlbumsQuery>;
export type GetArtistAlbumsLazyQueryHookResult = ReturnType<typeof useGetArtistAlbumsLazyQuery>;
export type GetArtistAlbumsSuspenseQueryHookResult = ReturnType<typeof useGetArtistAlbumsSuspenseQuery>;
export type GetArtistAlbumsQueryResult = Apollo.QueryResult<GetArtistAlbumsQuery, GetArtistAlbumsQueryVariables>;
export const GetArtistFullDocument = gql`
    query GetArtistFull($artistName: String, $artistId: String) {
  artist(params: {name: $artistName, id: $artistId}) {
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
 *      artistId: // value for 'artistId'
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
export function useGetArtistFullSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArtistFullQuery, GetArtistFullQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArtistFullQuery, GetArtistFullQueryVariables>(GetArtistFullDocument, options);
        }
export type GetArtistFullQueryHookResult = ReturnType<typeof useGetArtistFullQuery>;
export type GetArtistFullLazyQueryHookResult = ReturnType<typeof useGetArtistFullLazyQuery>;
export type GetArtistFullSuspenseQueryHookResult = ReturnType<typeof useGetArtistFullSuspenseQuery>;
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
export function useGetArtistsPageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArtistsPageQuery, GetArtistsPageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArtistsPageQuery, GetArtistsPageQueryVariables>(GetArtistsPageDocument, options);
        }
export type GetArtistsPageQueryHookResult = ReturnType<typeof useGetArtistsPageQuery>;
export type GetArtistsPageLazyQueryHookResult = ReturnType<typeof useGetArtistsPageLazyQuery>;
export type GetArtistsPageSuspenseQueryHookResult = ReturnType<typeof useGetArtistsPageSuspenseQuery>;
export type GetArtistsPageQueryResult = Apollo.QueryResult<GetArtistsPageQuery, GetArtistsPageQueryVariables>;
export const GetUnratedAlbumsDocument = gql`
    query GetUnratedAlbums {
  unratedAlbums {
    id
    artist {
      id
      name
    }
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
    ${SongFieldsFragmentDoc}`;

/**
 * __useGetUnratedAlbumsQuery__
 *
 * To run a query within a React component, call `useGetUnratedAlbumsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUnratedAlbumsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUnratedAlbumsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUnratedAlbumsQuery(baseOptions?: Apollo.QueryHookOptions<GetUnratedAlbumsQuery, GetUnratedAlbumsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUnratedAlbumsQuery, GetUnratedAlbumsQueryVariables>(GetUnratedAlbumsDocument, options);
      }
export function useGetUnratedAlbumsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUnratedAlbumsQuery, GetUnratedAlbumsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUnratedAlbumsQuery, GetUnratedAlbumsQueryVariables>(GetUnratedAlbumsDocument, options);
        }
export function useGetUnratedAlbumsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUnratedAlbumsQuery, GetUnratedAlbumsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUnratedAlbumsQuery, GetUnratedAlbumsQueryVariables>(GetUnratedAlbumsDocument, options);
        }
export type GetUnratedAlbumsQueryHookResult = ReturnType<typeof useGetUnratedAlbumsQuery>;
export type GetUnratedAlbumsLazyQueryHookResult = ReturnType<typeof useGetUnratedAlbumsLazyQuery>;
export type GetUnratedAlbumsSuspenseQueryHookResult = ReturnType<typeof useGetUnratedAlbumsSuspenseQuery>;
export type GetUnratedAlbumsQueryResult = Apollo.QueryResult<GetUnratedAlbumsQuery, GetUnratedAlbumsQueryVariables>;
export const SearchExternalArtistDocument = gql`
    query SearchExternalArtist($name: String!) {
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
export function useSearchExternalArtistQuery(baseOptions: Apollo.QueryHookOptions<SearchExternalArtistQuery, SearchExternalArtistQueryVariables> & ({ variables: SearchExternalArtistQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>(SearchExternalArtistDocument, options);
      }
export function useSearchExternalArtistLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>(SearchExternalArtistDocument, options);
        }
export function useSearchExternalArtistSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>(SearchExternalArtistDocument, options);
        }
export type SearchExternalArtistQueryHookResult = ReturnType<typeof useSearchExternalArtistQuery>;
export type SearchExternalArtistLazyQueryHookResult = ReturnType<typeof useSearchExternalArtistLazyQuery>;
export type SearchExternalArtistSuspenseQueryHookResult = ReturnType<typeof useSearchExternalArtistSuspenseQuery>;
export type SearchExternalArtistQueryResult = Apollo.QueryResult<SearchExternalArtistQuery, SearchExternalArtistQueryVariables>;
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