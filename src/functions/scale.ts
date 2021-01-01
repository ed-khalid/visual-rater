
import { scaleLinear, ScaleLinear } from 'd3-scale';


export class Scaler {

    private score = {
        start: 0
        ,end: 5
    }     
    private line  = {
        start: 5
        ,end: -1 
    } 


    constructor(yEnd:number) 
    {
        this.line.end = yEnd - 5  
        this.scale = scaleLinear().domain([this.score.start,this.score.end])
                                            .range([this.line.end,this.line.start])
    }

    public scale:ScaleLinear<number,number>;

    public toScore     = (yPosition:number) => this.scale.invert(yPosition) 
    public toPosition  = (score:number) => { 
        const val  = this.scale(score)
        return val
    }

      public get yScale () {
          return this.scale
      } 
      public set yScale(newScale:ScaleLinear<number,number>) {
          this.scale = newScale 
      }
      public rescale(newScale:ScaleLinear<number,number>) {
          this.scale = newScale
          return this
      }
}  