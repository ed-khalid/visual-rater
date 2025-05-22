
export type ArtistScoreCategory  = 'A+'|'A'|'B+'|'B'|'C+'|'C'|'D'|'E'|'F'|'UNRATED'  
export type AlbumScoreCategory   = 'A+'|'A'|'B+'|'B'|'C+'|'C'|'D'|'E'|'F'|'UNRATED'  
export type SongScoreCategory    = 'CLASSIC'|'GREAT'|'VERY GOOD'|'GOOD'|'PLEASANT'|'DECENT'|'INTERESTING'|'OK'|'MEH'|'AVERAGE'|'BORING'|'POOR'|'BAD'|'OFFENSIVE'|'UNRATED'  

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

export type SongScoreUI = SongScoreUIBase & { score?:number } 
export type ArtistScoreUI = ArtistScoreUIBase & { score?:string } 

export type SongScoreCategoryUI = {
    category:SongScoreCategory
    value:number
}

const CLASSIC_COLOR = 'rgb(80,90,179)'
const GREAT_COLOR = 'rgb(1, 71, 97)'
const VERY_GOOD_COLOR = 'rgb(10, 100, 37)'
const GOOD_COLOR = 'rgb(0,130,40)'
const PLEASANT_COLOR = 'rgb(100,170,120)'     
const DECENT_COLOR = 'rgb(120,170,100)'
const INTERESTING_COLOR = 'rgb(112, 150, 93)'
const OK_COLOR = 'rgb(110, 130, 80)'    
const MEH_COLOR = 'rgb(137, 137, 17)'
const AVERAGE_COLOR = 'rgb(130, 130, 80)'
const BORING_COLOR = 'rgb(170,130,90)'
const POOR_COLOR = 'rgb(201, 63, 41)'
const BAD_COLOR = 'rgb(221, 31, 21)'
const OFFENSIVE_COLOR = 'rgb(13, 20, 20)'
const UNRATED_COLOR = 'rgb(96, 94, 94)'


export const SONG_SCORE_DICTIONARY = new Map<SongScoreCategory, SongScoreUIBase>()   
SONG_SCORE_DICTIONARY.set('UNRATED', {
    category: 'UNRATED', color: UNRATED_COLOR, threshold: { low: 0, high: 0} })
SONG_SCORE_DICTIONARY.set('CLASSIC', 
    { category: 'CLASSIC', color: CLASSIC_COLOR, threshold: { low: 95, high: 100} })
SONG_SCORE_DICTIONARY.set('GREAT', 
    { category: 'GREAT', color: GREAT_COLOR, threshold: { low:90, high:94 }}) 
SONG_SCORE_DICTIONARY.set('VERY GOOD', 
    { category: 'VERY GOOD', color: VERY_GOOD_COLOR, threshold: { low:85, high: 89}})
SONG_SCORE_DICTIONARY.set('GOOD', 
    { category: 'GOOD', color: GOOD_COLOR, threshold: { low: 80, high: 84}})
SONG_SCORE_DICTIONARY.set('PLEASANT', 
    { category: 'PLEASANT', color:PLEASANT_COLOR, threshold: {low: 75, high: 79} })
SONG_SCORE_DICTIONARY.set('DECENT', 
    { category: 'DECENT', color: DECENT_COLOR, threshold: {low: 70, high: 74} })
SONG_SCORE_DICTIONARY.set('INTERESTING', 
    { category: 'INTERESTING', color:INTERESTING_COLOR, threshold:{low: 65, high: 69}})
SONG_SCORE_DICTIONARY.set('OK', 
    { category: 'OK', color: OK_COLOR, threshold: {low:60,high:64} })
SONG_SCORE_DICTIONARY.set('MEH', 
    { category: 'MEH', color: MEH_COLOR, threshold: {low:55,high:59} })
SONG_SCORE_DICTIONARY.set('AVERAGE', 
    { category: 'AVERAGE', color: AVERAGE_COLOR, threshold: {low:50,high:54}})
SONG_SCORE_DICTIONARY.set('BORING', 
    { category: 'BORING', color: BORING_COLOR, threshold: {low:40,high:49} })
SONG_SCORE_DICTIONARY.set('POOR', 
    { category: 'POOR', color: POOR_COLOR, threshold: {low:30,high:39} })
SONG_SCORE_DICTIONARY.set('BAD', 
    { category: 'BAD', color: BAD_COLOR, threshold: {low:10,high:29} })
SONG_SCORE_DICTIONARY.set('OFFENSIVE', 
    { category: 'OFFENSIVE', color: OFFENSIVE_COLOR, threshold: {low:0,high:9} })

export const ARTIST_SCORE_MAP:Map<ArtistScoreCategory, ArtistScoreUIBase> = new Map()   
ARTIST_SCORE_MAP.set('A+',{ category: 'A+', color: CLASSIC_COLOR, threshold: {low:90,high:Infinity} }) 
ARTIST_SCORE_MAP.set('A' ,{ category: 'A' , color: GREAT_COLOR, threshold: {low:80,high:89.99}  }) 
ARTIST_SCORE_MAP.set('B+',{ category: 'B+', color: VERY_GOOD_COLOR, threshold: {low:70,high:79.99}  })
ARTIST_SCORE_MAP.set('B', { category: 'B' , color: GOOD_COLOR, threshold: {low:60,high:69.99}  })
ARTIST_SCORE_MAP.set('C+', { category: 'C+' , color: DECENT_COLOR, threshold: {low:50, high:59.99} })
ARTIST_SCORE_MAP.set('C',  { category: 'C', color: AVERAGE_COLOR, threshold: {low:40,high:49.99} })
ARTIST_SCORE_MAP.set('D',{ category: 'D' , color:  BORING_COLOR, threshold: {low:30,high:39.99} })
ARTIST_SCORE_MAP.set('E',  { category: 'E' , color: POOR_COLOR, threshold: {low:10,high:29.99} })
ARTIST_SCORE_MAP.set('F', { category: 'F' , color:  BAD_COLOR, threshold: {low:0,high:9.99}  })
ARTIST_SCORE_MAP.set('UNRATED', { category: 'UNRATED' , color: UNRATED_COLOR, threshold: {low:-Infinity,high:-Infinity}  })



