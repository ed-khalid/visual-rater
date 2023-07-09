
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { RATER_Y_BOTTOM } from '../models/ui/RaterTypes';

export class Scaler {

    private score = {
        start: 0
        ,end: 5
    }     
    private line  = {
        start: 5
        ,end: RATER_Y_BOTTOM 
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

export function clampToNearestIncrement(rawScore:number) {
    // 375 
    let byHundred = Math.round(rawScore * 100)
    const firstDigit = byHundred % 10;    
    if (firstDigit > 5) {
        byHundred = byHundred - (firstDigit-5)    
    } 
    if (firstDigit !==0 && firstDigit < 5) {
        byHundred = byHundred - (firstDigit)    
    }
        return byHundred/100;
    }
