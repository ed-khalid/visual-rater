
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { AppConstants } from '../App';


export class Scaler {

    private score = {
        start: 0
        ,end: 5
    }     
    private line  = {
        start: 5
        ,end: AppConstants.rater.position.y 
    } 
    public scale:ScaleLinear<number,number>;
    public get yScale() { 
        return this.scale
    }
    public set yScale(newScale:ScaleLinear<number,number>) {
        this.scale = newScale 
    }

    constructor(newScale?:ScaleLinear<number,number>) 
    {
        this.scale = newScale || this.createDefaultScale()
    }

    private createDefaultScale() {
        return scaleLinear().domain([this.score.start,this.score.end])
                            .range([this.line.end,this.line.start])
    }  

    public toScore     = (yPosition:number) => this.scale.invert(yPosition) 
    public toPosition  = (score:number) => this.scale(score) 

}  