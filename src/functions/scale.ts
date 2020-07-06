
import { scaleLinear, ScaleLinear } from 'd3-scale';


export class Scaler {

    constructor(domainEnd:number) 
    {
        this.positionToScore = scaleLinear().domain([10, 734]).range([100,0]).clamp(true); 
        this.scoreToPosition = scaleLinear().domain([100,0]).range([10,734]).clamp(true);
    }

    private positionToScore:ScaleLinear<number,number>;
    private scoreToPosition:ScaleLinear<number,number>;

    public toScore     = (yPosition:number) => this.positionToScore(yPosition); 
    public toPosition  = (score:number) =>     this.scoreToPosition(score); 
}  