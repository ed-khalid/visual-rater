

export type ScoreUIBase = {
    description:ScoreDescriptor
    color:string
    threshold:number
}   
export type ScoreDescriptor = 'CLASSIC'|'GREAT'|'VERY GOOD'|'GOOD'|'DECENT'|'OK'|'MEH'|'AVERAGE'|'BORING'|'POOR'|'BAD'|'OFFENSIVE'  
export type ScoreUI = ScoreUIBase & { score:number } 
const SCORE_UI_MAP: {[index in ScoreDescriptor]:ScoreUIBase}  = {
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
  
 

export const mapScoreToUI  = (score:number) : ScoreUI  => {
    if (score < 0 || score > 5 ) {
        throw Error("Invalid Score") 
    }
    if (score >= 4.75) {
        return {...SCORE_UI_MAP['CLASSIC'], score }
    }
    if (score >= 4.5) {
        return {...SCORE_UI_MAP['GREAT'], score }
    }
    if (score >= 4.25) {
        return {...SCORE_UI_MAP['VERY GOOD'], score }
    }
    if (score >= 4) {
        return {...SCORE_UI_MAP['GOOD'], score }
    }
    if (score >= 3.75) {
        return {...SCORE_UI_MAP['DECENT'], score }
    }
    if (score >= 3.5) {
        return {...SCORE_UI_MAP['OK'], score }
    }
    if (score >= 3.25) {
        return {...SCORE_UI_MAP['MEH'], score }
    }
    if (score >= 3) {
        return {...SCORE_UI_MAP['AVERAGE'], score }
    }
    if (score >= 2.5) {
        return {...SCORE_UI_MAP['BORING'], score }
    }
    if (score >= 2) {
        return {...SCORE_UI_MAP['POOR'], score }
    }
    if (score >= 1) {
        return {...SCORE_UI_MAP['BAD'], score }
    }
    if (score >= 0) {
        return {...SCORE_UI_MAP['OFFENSIVE'], score }
    } else {
        throw Error('Score outside of bounds')

    }
}  