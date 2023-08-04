import { SCORE_END, SCORE_START } from "../models/domain/ItemTypes"

export type SongScoreUIBase = {
    description:SongScoreDescriptor
    color:string
    threshold:number
}   
export type ArtistScoreUIBase = {
    description:ScoreDescriptor
    color:string
    threshold:number
}
export type AlbumScoreUIBase = {
    description:ScoreDescriptor
    color:string
    threshold:number
}
export type ScoreDescriptor = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'  
export type SongScoreDescriptor = 'CLASSIC'|'GREAT'|'VERY GOOD'|'GOOD'|'PLEASANT'|'DECENT'|'INTERESTING'|'OK'|'MEH'|'AVERAGE'|'BORING'|'POOR'|'BAD'|'OFFENSIVE'  
const ARTIST_SCORE_UI_MAP: {[index in ScoreDescriptor]:ArtistScoreUIBase}  = {
    'A': { description: 'A', color: '#018c16', threshold: 4  } ,
    'B': { description: 'B', color: '#1df23d', threshold: 3.5 },
    'C': { description: 'C', color: '#cff78d', threshold: 3 },
    'D': { description: 'D', color: '#f2e89b', threshold: 2.5 },
    'E': { description: 'E', color: '#e34119', threshold: 1 },
    'F': { description: 'F', color: '#fa2100', threshold: 0 },
} 
export type SongScoreUI = SongScoreUIBase & { score:number } 
export type ArtistScoreUI = ArtistScoreUIBase & { score:string } 
const SONG_SCORE_UI_MAP: {[index in SongScoreDescriptor]:SongScoreUIBase}  = {
    'CLASSIC': { description: 'CLASSIC', color: '#424bf5', threshold: 95 },
    'GREAT': { description: 'GREAT', color: '#018c16', threshold: 90  } ,
    'VERY GOOD': { description: 'VERY GOOD', color: '#00de21', threshold: 85 },
    'GOOD': { description: 'GOOD', color: '#1df23d', threshold: 80 },
    'PLEASANT': { description: 'PLEASANT', color: '#b0f78d', threshold: 75 },
    'DECENT': { description: 'DECENT', color: '#b0f78d', threshold: 70 },
    'INTERESTING': { description: 'INTERESTING', color: '#b0f78d', threshold: 65 },
    'OK': { description: 'OK', color: '#cff78d', threshold: 60 },
    'MEH': { description: 'MEH', color: '#daf50c', threshold: 55 },
    'AVERAGE': { description: 'AVERAGE', color: '#edff66', threshold: 50 },
    'BORING': { description: 'BORING', color: '#f2e89b', threshold: 40 },
    'POOR': { description: 'POOR', color: '#f2ce9b', threshold: 30 },
    'BAD': { description: 'BAD', color: '#e34119', threshold: 10 },
    'OFFENSIVE': { description: 'OFFENSIVE', color: '#fa2100', threshold: 0 },
} 
  

export const mapArtistScoreToUI = (score:number) : ArtistScoreUI => {
    if (score < SCORE_START || score > SCORE_END ) {
        throw Error("Invalid Score") 
    }
    if (score >= 80) {
        return {...ARTIST_SCORE_UI_MAP['A'], score:score.toFixed(2)}
    }
    if (score >= 70) {
        return {...ARTIST_SCORE_UI_MAP['B'], score:score.toFixed(2)}
    }
    if (score >= 60) {
        return {...ARTIST_SCORE_UI_MAP['C'], score:score.toFixed(2)}
    }
    if (score >= 50) {
        return {...ARTIST_SCORE_UI_MAP['D'], score:score.toFixed(2)}
    }
    if (score >= 40) {
        return {...ARTIST_SCORE_UI_MAP['E'], score:score.toFixed(2)}
    }
    return {...ARTIST_SCORE_UI_MAP['F'], score:score.toFixed(2)}
}  
 

export const mapSongScoreToUI  = (score:number) : SongScoreUI  => {
    if (score < SCORE_START || score > SCORE_END ) {
        throw Error("Invalid Score") 
    }
    if (score >= 95) {
        return {...SONG_SCORE_UI_MAP['CLASSIC'], score }
    }
    if (score >= 90) {
        return {...SONG_SCORE_UI_MAP['GREAT'], score }
    }
    if (score >= 85) {
        return {...SONG_SCORE_UI_MAP['VERY GOOD'], score }
    }
    if (score >= 80) {
        return {...SONG_SCORE_UI_MAP['GOOD'], score }
    }
    if (score >= 75) {
        return {...SONG_SCORE_UI_MAP['PLEASANT'], score }
    }
    if (score >= 70) {
        return {...SONG_SCORE_UI_MAP['DECENT'], score }
    }
    if (score >= 65) {
        return {...SONG_SCORE_UI_MAP['INTERESTING'], score }
    }
    if (score >= 60) {
        return {...SONG_SCORE_UI_MAP['OK'], score }
    }
    if (score >= 55) {
        return {...SONG_SCORE_UI_MAP['MEH'], score }
    }
    if (score >= 50) {
        return {...SONG_SCORE_UI_MAP['AVERAGE'], score }
    }
    if (score >= 40) {
        return {...SONG_SCORE_UI_MAP['BORING'], score }
    }
    if (score >= 30) {
        return {...SONG_SCORE_UI_MAP['POOR'], score }
    }
    if (score >= 10) {
        return {...SONG_SCORE_UI_MAP['BAD'], score }
    }
    if (score >= 0) {
        return {...SONG_SCORE_UI_MAP['OFFENSIVE'], score }
    } else {
        throw Error('Score outside of bounds')

    }
}  