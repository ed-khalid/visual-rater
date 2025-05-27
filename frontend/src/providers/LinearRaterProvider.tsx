import { scaleLinear, ScaleLinear } from "d3";
import { createContext } from "react";
import { LinearRaterCircleModel } from "../models/RaterModels";


export const LinearRaterContext = createContext<LinearRaterContext>({ mainlineX: 0, yToScore: scaleLinear(), raterHeight: 0, onDragEnd: () => {}, onDragStart: () => {}, getScoreCategoryDetails: () => ({ color: '', category: ''}) })   

export interface LinearRaterContext {
    mainlineX:number
    yToScore:ScaleLinear<number,number,never> 
    raterHeight:number
    onDragStart: (item:LinearRaterCircleModel) => void
    onDragEnd: (item:LinearRaterCircleModel, newScore:number) => void 
    getScoreCategoryDetails: (score:number) => { color: string, category: string } 

} 