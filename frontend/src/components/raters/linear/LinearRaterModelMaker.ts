import { ScaleLinear } from "d3";
import { Song } from "../../../generated/graphql";
import { isMultiple, isSingle, LinearRaterBaseModel, LinearRaterCircleModel, LinearRaterGroup, LinearRaterItemModel as LinearRaterSingleItemModel } from "../../../models/LinearRaterModels";

const stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
const punctuationRegex = (/[.,!?;:'"()\[\]{}\-]/)
export class LinearRaterModelMaker  {

    private ratedItems:Song[]  
    private unratedItems:Song[]  
    private yToScore:ScaleLinear<number,number, never>
    private finalItems:LinearRaterBaseModel[] 

    constructor(items: Song[], scale:ScaleLinear<number,number,never>) {
        this.ratedItems = items.filter(it => it.score !== null);
        this.unratedItems = items.filter(it => it.score === null)
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
      this.unratedItems.sort((a,b) => a.number - b.number)
      const circleModels = this.unratedItems.map<LinearRaterCircleModel>((song) => (
          ({ id: song.id, name: this.determineSongNameLabel(song)}) ) 
      ) 
      return {
        id: 'linear-rater-unrated-items',
        type: 'single',
        position: 0,
        score: 0, 
        items: circleModels
      }
    } 

    private mapSongToLinearRaterCircleModel(songs:Song[]): LinearRaterCircleModel[] {
      const sortedSongs = songs.sort((a,b) => {
        if (a.score !== b.score) {
          return b.score! - a.score!
        }
        return a.name.localeCompare(b.name)
      }) 
      const circleModels = sortedSongs.map((song) => ({
        id: song.id,
        name: this.determineSongNameLabel(song)  
      }))
      return circleModels
    }


    public makeSingleModeItems() {
        this.finalItems = this.ratedItems.map<LinearRaterSingleItemModel>((entry, i) => ({ type: 'single', id: 'linear-rater-group-' + i, position: this.yToScore.invert(entry.score!), score: entry.score! , items: this.mapSongToLinearRaterCircleModel([entry]) }))
        return this
    }   


    public groupByScore() {
        const scoreMap = new Map<number, Song[]>() 
        this.ratedItems.forEach((song) => {
        const score = song.score 
        const songsWithScore = scoreMap.get(score!)    
        if (songsWithScore) {
            scoreMap.set(song.score!, [...songsWithScore, song ] )
        } else {
            scoreMap.set(song.score!, [song] )
        }
        })
        this.finalItems = scoreMap.entries().map<LinearRaterSingleItemModel>((entry, i) => ({ type: 'single', id: 'linear-rater-group-' + i, position: this.yToScore.invert(entry[0]), score: entry[0],  items: this.mapSongToLinearRaterCircleModel(entry[1]) })).toArray()
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

  private sortByScore = (a:LinearRaterSingleItemModel, b:LinearRaterSingleItemModel) => b.score - a.score

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
          newGroup.items.sort(this.sortByScore)
          const accWithoutOverlap = acc.filter(it => it !== overlap)  
          return [...accWithoutOverlap, newGroup]
        } else if (isMultiple(overlap)) {
          const newGroup:LinearRaterGroup = {
            id: `linear-rater-group-${overlap.position}-${it.position}`,
            type: 'multiple',
            items : (isSingle(it)) ? ([...overlap.items, it]) : isMultiple(it) ? [...overlap.items, ...it.items] : [], 
            scoreRange: this.determineScoreRange(overlap, it), 
            position: (overlap.position + it.position)/2  
          }
          newGroup.items.sort(this.sortByScore)
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