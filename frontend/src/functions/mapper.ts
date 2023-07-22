import { createRef } from "react";
import { Album, Artist, ComparisonSong, Song } from "../generated/graphql";
import { ComparisonSongUIItem, RatedMusicItemUI, RatedSongItemUI } from "../models/ui/ItemTypes";
import { RaterOrientation } from "../models/ui/RaterTypes";

export const mapSongToRatedItem = (song: Song, album: Album, orientation: RaterOrientation): RatedSongItemUI => new RatedSongItemUI({ id: song.id, name: song.name }, song.score!, album.thumbnail!, orientation, 1, album.dominantColor, song.number, createRef(), album.name);
export const mapAlbumToRatedItem = (album: Album, orientation: RaterOrientation): RatedMusicItemUI => new RatedMusicItemUI({ id: album.id, name: album.name }, album.score!, album.thumbnail!, orientation, 1, createRef(), album.dominantColor)
export const mapArtistToRatedItem = (artist: Artist, orientation: RaterOrientation): RatedMusicItemUI => new RatedMusicItemUI({ id: artist.id, name: artist.name }, artist.score!, artist.thumbnail!, orientation, 1, createRef(), '(0,0,0)')
export const mapComparisonSongToComparisonSongUIItem = (comparisonSong:ComparisonSong, isTarget:boolean) =>  new ComparisonSongUIItem(comparisonSong.id, comparisonSong.songName,comparisonSong.songScore, isTarget, comparisonSong.artistName,comparisonSong.albumName, comparisonSong.thumbnail!, comparisonSong.albumDominantColor)   