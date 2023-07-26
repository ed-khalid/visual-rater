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
export type SongScoreDescriptor = 'CLASSIC'|'GREAT'|'VERY GOOD'|'GOOD'|'DECENT'|'OK'|'MEH'|'AVERAGE'|'BORING'|'POOR'|'BAD'|'OFFENSIVE'  
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
    'CLASSIC': { description: 'CLASSIC', color: '#424bf5', threshold: 4.75 },
    'GREAT': { description: 'GREAT', color: '#018c16', threshold: 4.5  } ,
    'VERY GOOD': { description: 'VERY GOOD', color: '#00de21', threshold: 4.25 },
    'GOOD': { description: 'GOOD', color: '#1df23d', threshold: 4 },
    'DECENT': { description: 'DECENT', color: '#b0f78d', threshold: 3.75 },
    'OK': { description: 'OK', color: '#cff78d', threshold: 3.5 },
    'MEH': { description: 'MEH', color: '#daf50c', threshold: 3.25 },
    'AVERAGE': { description: 'AVERAGE', color: '#edff66', threshold: 3 },
    'BORING': { description: 'BORING', color: '#f2e89b', threshold:2.5 },
    'POOR': { description: 'POOR', color: '#f2ce9b', threshold: 2 },
    'BAD': { description: 'BAD', color: '#e34119', threshold: 1 },
    'OFFENSIVE': { description: 'OFFENSIVE', color: '#fa2100', threshold: 0 },
} 
  

export const mapArtistScoreToUI = (score:number) : ArtistScoreUI => {
    if (score < 0 || score > 5 ) {
        throw Error("Invalid Score") 
    }
    if (score >= 4) {
        return {...ARTIST_SCORE_UI_MAP['A'], score:score.toFixed(2)}
    }
    if (score >= 3.5) {
        return {...ARTIST_SCORE_UI_MAP['B'], score:score.toFixed(2)}
    }
    if (score >= 3) {
        return {...ARTIST_SCORE_UI_MAP['C'], score:score.toFixed(2)}
    }
    if (score >= 2.5) {
        return {...ARTIST_SCORE_UI_MAP['D'], score:score.toFixed(2)}
    }
    if (score >= 1) {
        return {...ARTIST_SCORE_UI_MAP['E'], score:score.toFixed(2)}
    }
    return {...ARTIST_SCORE_UI_MAP['F'], score:score.toFixed(2)}
}  
 

export const mapSongScoreToUI  = (score:number) : SongScoreUI  => {
    if (score < 0 || score > 5 ) {
        throw Error("Invalid Score") 
    }
    if (score >= 4.75) {
        return {...SONG_SCORE_UI_MAP['CLASSIC'], score }
    }
    if (score >= 4.5) {
        return {...SONG_SCORE_UI_MAP['GREAT'], score }
    }
    if (score >= 4.25) {
        return {...SONG_SCORE_UI_MAP['VERY GOOD'], score }
    }
    if (score >= 4) {
        return {...SONG_SCORE_UI_MAP['GOOD'], score }
    }
    if (score >= 3.75) {
        return {...SONG_SCORE_UI_MAP['DECENT'], score }
    }
    if (score >= 3.5) {
        return {...SONG_SCORE_UI_MAP['OK'], score }
    }
    if (score >= 3.25) {
        return {...SONG_SCORE_UI_MAP['MEH'], score }
    }
    if (score >= 3) {
        return {...SONG_SCORE_UI_MAP['AVERAGE'], score }
    }
    if (score >= 2.5) {
        return {...SONG_SCORE_UI_MAP['BORING'], score }
    }
    if (score >= 2) {
        return {...SONG_SCORE_UI_MAP['POOR'], score }
    }
    if (score >= 1) {
        return {...SONG_SCORE_UI_MAP['BAD'], score }
    }
    if (score >= 0) {
        return {...SONG_SCORE_UI_MAP['OFFENSIVE'], score }
    } else {
        throw Error('Score outside of bounds')

    }
}  