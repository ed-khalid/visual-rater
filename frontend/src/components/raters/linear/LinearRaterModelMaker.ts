import { ScaleLinear } from "d3";
import { Song } from "../../../generated/graphql";
import { FatSong } from "../../../models/CoreModels";
import { isMultiple, isSingle, LinearRaterBaseModel, LinearRaterCircleModel, LinearRaterGroup, LinearRaterItemModel as LinearRaterSingleItemModel } from "../../../models/RaterModels";

const stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
const punctuationRegex = (/[.,!?;:'"()\[\]{}\-]/)
export class LinearRaterModelMaker  {

    private ratedItems:FatSong[]  
    private unratedItems:FatSong[]  
    private yToScore:ScaleLinear<number,number, never>
    private finalItems:LinearRaterBaseModel[] 

    constructor(items: FatSong[], scale:ScaleLinear<number,number,never>) {
        this.ratedItems = items.filter(it => it.song.score !== null);
        this.unratedItems = items.filter(it => it.song.score === null)
        this.yToScore = scale
        this.finalItems = []
    }
    private determineSongNameLabel (song:Song)  {
        if (song.shortname) {
        return song.shortname
        } else {
          const res = []
          const words = song.name.toLowerCase().split(' ') 
          for (var i = 0; i < words.length; i++) {
            const word = words[i].split(punctuationRegex).join("") 
            if (!stopwords.includes(word)) {
              res.push(word)
            }
          }
          if (res.length) {
            return res[0]
          } else {
            return song.name.toLowerCase().split(' ')[0]
          }
        } 
    }

    private makeUnratedItems(): LinearRaterSingleItemModel {
      const circleModels = this.unratedItems.map<LinearRaterCircleModel>((fatSong) => (
          ({ id: fatSong.song.id, name: this.determineSongNameLabel(fatSong.song)}) ) 
      ) 
      return {
        id: 'linear-rater-unrated-items',
        type: 'single',
        position: 0,
        score: 0, 
        items: circleModels
      }
    } 

    public groupByScore() {
        const scoreMap = new Map<number, FatSong[]>() 
        this.ratedItems.forEach((fatSong) => {
        const score = fatSong.song.score 
        const songsWithScore = scoreMap.get(score!)    
        if (songsWithScore) {
            scoreMap.set(fatSong.song.score!, [...songsWithScore, fatSong ] )
        } else {
            scoreMap.set(fatSong.song.score!, [fatSong] )
        }
        })
        this.finalItems = scoreMap.entries().map<LinearRaterSingleItemModel>((entry, i) => ({ type: 'single', id: 'linear-rater-group-' + i, position: this.yToScore.invert(entry[0]), score: entry[0],  items: entry[1].map((fatSong) =>  ({ id: fatSong.song.id, name: this.determineSongNameLabel(fatSong.song)}) ) })).toArray()
        return this
    }
  public getLargestItemCount() {
     return this.finalItems.reduce<number>((acc,it) => {
      if (isSingle(it)) {
        if (it.items.length > acc) return it.items.length
        else return acc
      } else if (isMultiple(it)) {
        const allItems = it.items.flatMap(it => it.items)
        if (allItems.length > acc) return allItems.length
        else return acc
      } else throw "impossible"
    }, 1)
  }

  private getLowestScore(numbers:number[])  {
    return numbers.reduce<number>((acc,it) => Math.min(acc,it), 100)
  }
  private getHighestScore(numbers:number[])  {
    return numbers.reduce<number>((acc,it) => Math.max(acc,it), 0)
  }

  private determineScoreRange(item1:LinearRaterBaseModel, item2:LinearRaterBaseModel) {
    if (isSingle(item1) && isSingle(item2)) {
      const numbers = [item1.score, item2.score] 
      return { low: this.getLowestScore(numbers), high: this.getHighestScore(numbers)}
    }
    if (isSingle(item1) && isMultiple(item2)) {
      const numbers = [ item1.score, ...(item2.items.map(it =>it.score)) ]
      return { low: this.getLowestScore(numbers), high: this.getHighestScore(numbers)}
    }
    if (isMultiple(item1) && isSingle(item2)) {
      const numbers = [ item2.score, ...(item1.items.map(it =>it.score)) ]
      return { low: this.getLowestScore(numbers), high: this.getHighestScore(numbers)}
    }
    if (isMultiple(item1) && isMultiple(item2)) {
      const numbers = [ ...(item2.items.map(it => it.score)), ...(item1.items.map(it =>it.score)) ]
      return { low: this.getLowestScore(numbers), high: this.getHighestScore(numbers)}
    } else throw "impossible"
  }


  public groupByProximity(threshold:number) {
    const retv = this.finalItems.reduce<LinearRaterBaseModel[]>((acc, it) => {
      const overlap = acc.find(group => Math.abs(it.position - group.position) <= threshold)
      if (overlap) {
        if (isSingle(overlap)) {
          const newGroup:LinearRaterGroup = {
            id: `linear-rater-group-${overlap.position}-${it.position}`,
            type: 'multiple',
            items : (isSingle(it)) ? [overlap, it] : isMultiple(it) ? [overlap, ...it.items]: [], 
            scoreRange: this.determineScoreRange(overlap, it),
            position: (overlap.position + it.position)/2  
          }  
          const accWithoutOverlap = acc.filter(it => it !== overlap)  
          return [...accWithoutOverlap, newGroup]
        } else if (isMultiple(overlap)) {
          const newGroup:LinearRaterGroup = {
            id: `linear-rater-group-${overlap.position}-${it.position}`,
            type: 'multiple',
            items : (isSingle(it)) ? [...overlap.items, it] : isMultiple(it) ? [...overlap.items, ...it.items] : [], 
            scoreRange: this.determineScoreRange(overlap, it), 
            position: (overlap.position + it.position)/2  
          }
          const accWithoutOverlap = acc.filter(it => it !== overlap)  
          return [...accWithoutOverlap, newGroup]
        } else {
          throw "linear rater model can either be single or multiple"
        }
      } else {
        return [...acc, it]
      }
    }, [])
    this.finalItems = retv 
    return this 
  }  

  public getFinalValues() {
    return { groups: this.finalItems, unratedGroup: this.makeUnratedItems(), largestGroupItemCount: this.getLargestItemCount()}
  }
    





}