
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { CARTESIAN_RATER_Y_BOTTOM, CARTESIAN_RATER_Y_TOP } from '../models/RaterModels';
import { SCORE_END, SCORE_START } from '../models/CoreModels';

interface ScalerArguments {
    line?: {start:number, end:number}
    scale?: ScaleLinear<number,number>
} 


export class Scaler {

    private score = {
        start: SCORE_START
        ,end: SCORE_END
    }     
    private line  = {
        start: CARTESIAN_RATER_Y_TOP 
        ,end: CARTESIAN_RATER_Y_BOTTOM 
    } 
    public scale:ScaleLinear<number,number>;
    public get yScale() { 
        return this.scale
    }
    public set yScale(newScale:ScaleLinear<number,number>) {
        this.scale = newScale 
    }

    

    constructor(args?:ScalerArguments) 
    {
        this.line = args?.line || this.line  
        this.scale = args?.scale || this.createDefaultScale()
    }

    private createDefaultScale() {
        return scaleLinear().domain([this.score.start,this.score.end])
                            .range([this.line.end,this.line.start])
    }  

    public toScore     = (yPosition:number) => this.scale.invert(yPosition) 
    public toPosition  = (score:number) => this.scale(score) 

}  

export function clampToNearestIncrement(rawScore:number) {
    return Math.round(rawScore)
}
