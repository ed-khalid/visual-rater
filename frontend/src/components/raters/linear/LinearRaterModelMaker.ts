import { ScaleLinear } from "d3";
import { Song } from "../../../generated/graphql";
import { LinearRaterCircleModel } from "../../../models/LinearRaterModels";

const stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
const punctuationRegex = (/[.,!?;:'"()\[\]{}\-]/)
export class LinearRaterModelMaker  {

    private ratedItems:Song[]  
    private unratedItems:Song[]  
    private yToScore:ScaleLinear<number,number, never>

    constructor(items: Song[], scale:ScaleLinear<number,number,never>) {
        this.ratedItems = items.filter(it => it.score !== null).map(it => ({...it, score: Math.floor(it.score!) }) );
        this.unratedItems = items.filter(it => it.score === null)
        this.yToScore = scale
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

    private makeUnratedItems(): LinearRaterCircleModel[] {
      this.unratedItems.sort((a,b) => a.number - b.number)
      const circleModels = this.unratedItems.map<LinearRaterCircleModel>((song) => (
          ({ id: song.id, name: this.determineSongNameLabel(song), position: this.yToScore.invert(song.score!)  }) ) 
      ) 
      return circleModels
    } 

    private mapSongsToLinearRaterCircleModel(songs:Song[]): LinearRaterCircleModel[] {
      const sortedSongs = songs.sort((a,b) => a.number - b.number)
      const circleModels = sortedSongs.map((song) => ({
        id: song.id,
        name: this.determineSongNameLabel(song),  
        position: this.yToScore.invert(song.score!) 
      }))
      return circleModels
    }


  public getFinalValues() {
    return { items: this.mapSongsToLinearRaterCircleModel(this.ratedItems) , unratedItems: this.makeUnratedItems() }
  }
    





}