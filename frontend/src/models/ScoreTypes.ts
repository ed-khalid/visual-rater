
export type ArtistScoreCategory  = 'A+'|'A'|'B+'|'B'|'C+'|'C'|'D'|'E'|'F'  
export type AlbumScoreCategory   = 'A+'|'A'|'B+'|'B'|'C+'|'C'|'D'|'E'|'F'  
export type SongScoreCategory    = 'CLASSIC'|'GREAT'|'VERY GOOD'|'GOOD'|'PLEASANT'|'DECENT'|'INTERESTING'|'OK'|'MEH'|'AVERAGE'|'BORING'|'POOR'|'BAD'|'OFFENSIVE'  

export type ScoreThreshold = { low:number, high:number} 

export type SongScoreUIBase = {
    category:SongScoreCategory
    color:string
    threshold:ScoreThreshold
}   

export type ArtistScoreUIBase = {
    category:ArtistScoreCategory
    color:string
    threshold:ScoreThreshold
}

export type AlbumScoreUIBase = {
    category:AlbumScoreCategory
    color:string
    threshold:ScoreThreshold
}

export type SongScoreUI = SongScoreUIBase & { score:number } 
export type ArtistScoreUI = ArtistScoreUIBase & { score:string } 

export type SongScoreCategoryUI = {
    category:SongScoreCategory
    value:number
}

export const SONG_SCORE_DICTIONARY = new Map<SongScoreCategory, SongScoreUIBase>()   
SONG_SCORE_DICTIONARY.set('CLASSIC', 
    { category: 'CLASSIC', color: '#424bf5', threshold: { low: 95, high: 100} })
SONG_SCORE_DICTIONARY.set('GREAT', 
    { category: 'GREAT', color: '#018c16', threshold: { low:90, high:94 }}) 
SONG_SCORE_DICTIONARY.set('VERY GOOD', 
    { category: 'VERY GOOD', color: '#00de21', threshold: { low:85, high: 89}})
SONG_SCORE_DICTIONARY.set('GOOD', 
    { category: 'GOOD', color: '#1df23d', threshold: { low: 80, high: 84}})
SONG_SCORE_DICTIONARY.set('PLEASANT', 
    { category: 'PLEASANT', color: '#b0f78d', threshold: {low: 75, high: 79} })
SONG_SCORE_DICTIONARY.set('DECENT', 
    { category: 'DECENT', color: '#b0f78d', threshold: {low: 70, high: 74} })
SONG_SCORE_DICTIONARY.set('INTERESTING', 
    { category: 'INTERESTING', color: '#b0f78d', threshold:{low: 65, high: 69}})
SONG_SCORE_DICTIONARY.set('OK', 
    { category: 'OK', color: '#cff78d', threshold: {low:60,high:64} })
SONG_SCORE_DICTIONARY.set('MEH', 
    { category: 'MEH', color: '#daf50c', threshold: {low:55,high:59} })
SONG_SCORE_DICTIONARY.set('AVERAGE', 
    { category: 'AVERAGE', color: '#edff66', threshold: {low:50,high:54}})
SONG_SCORE_DICTIONARY.set('BORING', 
    { category: 'BORING', color: '#f2e89b', threshold: {low:40,high:44} })
SONG_SCORE_DICTIONARY.set('POOR', 
    { category: 'POOR', color: '#f2ce9b', threshold: {low:30,high:39} })
SONG_SCORE_DICTIONARY.set('BAD', 
    { category: 'BAD', color: '#e34119', threshold: {low:10,high:29} })
SONG_SCORE_DICTIONARY.set('OFFENSIVE', 
    { category: 'OFFENSIVE', color: '#fa2100', threshold: {low:0,high:9} })

export const ARTIST_SCORE_MAP:Map<ArtistScoreCategory, ArtistScoreUIBase> = new Map()   
ARTIST_SCORE_MAP.set('A+',{ category: 'A+', color: '#018c16', threshold: {low:90,high:100} }) 
ARTIST_SCORE_MAP.set('A' ,{ category: 'A' , color: '#018c16', threshold: {low:80,high:89}  }) 
ARTIST_SCORE_MAP.set('B+',{ category: 'B+', color: '#1df23d', threshold: {low:70,high:79}  })
ARTIST_SCORE_MAP.set('B', { category: 'B' , color: '#1df23d', threshold: {low:60,high:69}  })
ARTIST_SCORE_MAP.set('C+', { category: 'C' , color: '#cff78d', threshold: {low:50, high:59} })
ARTIST_SCORE_MAP.set('C',  { category: 'C+', color: '#cff78d', threshold: {low:40,high:49} })
ARTIST_SCORE_MAP.set('D',{ category: 'D' , color: '#f2e89b', threshold: {low:30,high:39} })
ARTIST_SCORE_MAP.set('E',  { category: 'E' , color: '#e34119', threshold: {low:10,high:29} })
ARTIST_SCORE_MAP.set('F', { category: 'F' , color: '#fa2100', threshold: {low:0,high:9}  })