import { scaleLinear, ScaleLinear } from "d3";
import { createContext } from "react";
import { LinearRaterCircleModel } from "../models/LinearRaterModels";


export const LinearRaterContext = createContext<LinearRaterContext>({ yToScore: scaleLinear(), raterHeight: 0, onDragEnd: () => {}, onDragStart: () => {}, getScoreCategoryDetails: () => ({ color: '', category: ''}), onCircleHover: () => {} })   

export interface LinearRaterContext {
    yToScore:ScaleLinear<number,number,never> 
    raterHeight:number
    onDragStart: (item:LinearRaterCircleModel) => void
    onDragEnd: (item:LinearRaterCircleModel, newScore:number) => void 
    getScoreCategoryDetails: (score:number) => { color: string, category: string } 
    onCircleHover: (item?: LinearRaterCircleModel, position?: {x:number,y:number} ) => void  
} 