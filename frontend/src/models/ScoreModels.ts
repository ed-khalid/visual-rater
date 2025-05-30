
export type ArtistScoreCategory  = 'A+'|'A'|'B+'|'B'|'C+'|'C'|'D'|'E'|'F'|'U'  
export type AlbumScoreCategory   = 'A+'|'A'|'B+'|'B'|'C+'|'C'|'D'|'E'|'F'|'U'  
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
export type AlbumScoreUI = AlbumScoreUIBase & {score?: string}

export type SongScoreCategoryUI = {
    category:SongScoreCategory
    value:number
}

export const CLASSIC_COLOR = 'rgb(79, 85, 144)'
export const GREAT_COLOR = 'rgb(32, 79, 96)'
export const VERY_GOOD_COLOR = 'rgb(40, 83, 53)'
export const GOOD_COLOR = 'rgb(47, 101, 63)'
export const PLEASANT_COLOR = 'rgb(78, 118, 90)'     
export const DECENT_COLOR = 'rgb(96, 130, 70)'
export const INTERESTING_COLOR = 'rgb(86, 98, 40)'
export const OK_COLOR = 'rgb(156, 156, 58)'
export const MEH_COLOR = 'rgb(162, 140, 75)'
export const AVERAGE_COLOR = 'rgb(179, 140, 55)'    
export const BORING_COLOR = 'rgb(161, 107, 57)'
export const POOR_COLOR = 'rgb(167, 55, 38)'
export const BAD_COLOR = 'rgb(88, 19, 16)'
export const OFFENSIVE_COLOR = 'rgb(8, 22, 22)'
export const UNRATED_COLOR = 'rgb(96, 94, 94)'


export const SONG_SCORE_DICTIONARY = new Map<SongScoreCategory, SongScoreUIBase>()   
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
    { category: 'OFFENSIVE', color: OFFENSIVE_COLOR, threshold: {low:-1,high:9} })
SONG_SCORE_DICTIONARY.set('UNRATED', 
    { category: 'UNRATED', color: UNRATED_COLOR, threshold: {low:-Infinity,high:-Infinity} })

export const ARTIST_SCORE_MAP:Map<ArtistScoreCategory, ArtistScoreUIBase> = new Map()   
ARTIST_SCORE_MAP.set('A+',{ category: 'A+', color: CLASSIC_COLOR, threshold: {low:90,high:Infinity} }) 
ARTIST_SCORE_MAP.set('A' ,{ category: 'A' , color: GREAT_COLOR, threshold: {low:80,high:89.99}  }) 
ARTIST_SCORE_MAP.set('B+',{ category: 'B+', color: VERY_GOOD_COLOR, threshold: {low:70,high:79.99}  })
ARTIST_SCORE_MAP.set('B', { category: 'B' , color: GOOD_COLOR, threshold: {low:60,high:69.99}  })
ARTIST_SCORE_MAP.set('C+', { category: 'C+' , color: PLEASANT_COLOR, threshold: {low:50, high:59.99} })
ARTIST_SCORE_MAP.set('C',  { category: 'C', color: INTERESTING_COLOR, threshold: {low:40,high:49.99} })
ARTIST_SCORE_MAP.set('D',{ category: 'D' , color:  BORING_COLOR, threshold: {low:30,high:39.99} })
ARTIST_SCORE_MAP.set('E',  { category: 'E' , color: POOR_COLOR, threshold: {low:10,high:29.99} })
ARTIST_SCORE_MAP.set('F', { category: 'F' , color:  BAD_COLOR, threshold: {low:0,high:9.99}  })
ARTIST_SCORE_MAP.set('U', { category: 'U' , color: UNRATED_COLOR, threshold: {low:-Infinity,high:-Infinity}  })


export const ALBUM_SCORE_MAP:Map<AlbumScoreCategory, AlbumScoreUIBase> = new Map()
ALBUM_SCORE_MAP.set('A+',{ category: 'A+', color: CLASSIC_COLOR, threshold: {low:80,high:Infinity} }) 
ALBUM_SCORE_MAP.set('A' ,{ category: 'A' , color: GREAT_COLOR, threshold: {low:75,high:79.99}  }) 
ALBUM_SCORE_MAP.set('B+',{ category: 'B+', color: VERY_GOOD_COLOR, threshold: {low:70,high:74.99}  })
ALBUM_SCORE_MAP.set('B', { category: 'B' , color: GOOD_COLOR, threshold: {low:65,high:69.99}  })
ALBUM_SCORE_MAP.set('C+', { category: 'C+' , color: INTERESTING_COLOR, threshold: {low:60, high:64.99} })
ALBUM_SCORE_MAP.set('C',  { category: 'C', color: AVERAGE_COLOR, threshold: {low:55,high:59.99} })
ALBUM_SCORE_MAP.set('D',{ category: 'D' , color:  POOR_COLOR, threshold: {low:50,high:54.99} })
ALBUM_SCORE_MAP.set('E',  { category: 'E' , color: BAD_COLOR, threshold: {low:40,high:49.99} })
ALBUM_SCORE_MAP.set('F', { category: 'F' , color:  OFFENSIVE_COLOR, threshold: {low:0,high:39.99}  })
ALBUM_SCORE_MAP.set('U', { category: 'U' , color: UNRATED_COLOR, threshold: {low:-Infinity,high:-Infinity}  })

