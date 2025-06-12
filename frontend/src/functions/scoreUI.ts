import { ArtistSongMetadata, Maybe, Song } from "../generated/graphql"
import { SCORE_END, SCORE_START } from "../models/CoreModels"
import { ALBUM_SCORE_MAP, AlbumScoreUI, ARTIST_SCORE_MAP, ArtistScoreUI, SONG_SCORE_DICTIONARY, SongScoreCategory, SongScoreCategoryUI , SongScoreUI } from "../models/ScoreModels"


export const mapAlbumSongsToSongScoreUI = (songs:Song[]) => {
    const retv:SongScoreCategoryUI[] = []
    if (!songs) {
        return retv
    }
    for (let[k,v] of SONG_SCORE_DICTIONARY) {
        retv.push({category:k, value: songs.filter(it => it.score! >= v.threshold.low && it.score! < v.threshold.high ).length   })
    } 
    return retv
}  

export const mapSongScoreCategoryToScoreFilter = (category:SongScoreCategory) => {
    let scoreFilter = { start:SCORE_START, end:SCORE_END }
    const value = SONG_SCORE_DICTIONARY.get(category)
    return (value) ? { start: value.threshold.low, end: value.threshold.high }  : scoreFilter 
}   

export const mapArtistSongMetadataToSongScoreUI =(metadata?:ArtistSongMetadata) => {
    const retv:SongScoreCategoryUI[] = [] 
    if (!metadata) return  retv

    const retrieveValue = (category: SongScoreCategory, metadata:ArtistSongMetadata):number => {
        switch(category) {
            case 'CLASSIC': return metadata.classic 
            case 'GREAT': return metadata.great 
            case 'VERY GOOD': return metadata.verygood 
            case 'GOOD': return metadata.good 
            case 'PLEASANT': return metadata.pleasant 
            case 'DECENT': return metadata.decent 
            case 'INTERESTING': return metadata.interesting 
            case 'OK': return metadata.ok 
            case 'MEH': return metadata.meh 
            case 'BORING': return metadata.boring 
            case 'AVERAGE': return metadata.average 
            case 'POOR': return metadata.poor 
            case 'BAD': return metadata.bad 
            case 'OFFENSIVE': return metadata.offensive 
            case 'UNRATED':  return -1 
        }
    }
    for (let[k] of SONG_SCORE_DICTIONARY) {
        retv.push({category: k, value: retrieveValue(k,metadata)   }  )
    } 
    return retv
} 

export const map100ScoreTo10Score = (score:Maybe<number>) => {
    if (score) {
      return score/10;
    } else {
        return 0 
    }
}  



  

export const mapArtistScoreToUI = (score?:Maybe<number>) : ArtistScoreUI => {
    for (let [,v] of ARTIST_SCORE_MAP) {
      let _score = score || -Infinity  
      if (v.threshold.low <= _score && v.threshold.high  >= _score ) { 
            if (v.category === 'U')  {
                return { ...v, score: 'unrated' }
            } else 
            return { ...v, score:_score.toFixed(1) }
      } 
    }
    throw Error('Score could not be found in dictionary')
}  

export const mapAlbumScoreToUI = (score?:Maybe<number>) : AlbumScoreUI => {
    for (let [,v] of ALBUM_SCORE_MAP) {
      let _score = score || -Infinity  
      if (v.threshold.low <= _score && v.threshold.high  >= _score ) { 
            if (v.category === 'U')  {
                return { ...v, score: 'unrated' }
            } else 
            return { ...v, score:_score.toFixed(1) }
      } 
    }
    throw Error('Score could not be found in dictionary')

} 
 


export const mapSongScoreToUI  = (score?:Maybe<number>) : SongScoreUI  => {
    if (score === undefined || score === null) {
        return { ...SONG_SCORE_DICTIONARY.get('UNRATED')!, score: -Infinity }
    }
    if (score < SCORE_START || score > SCORE_END ) {
        throw Error("Invalid Score") 
    }
    for (let [,v] of SONG_SCORE_DICTIONARY) {
        if (v.threshold.low <= score && v.threshold.high >= score) return { ...v, score } 
    } 
    throw Error('Score could not be found in dictionary')
}  