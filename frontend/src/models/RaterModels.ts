import { Ref } from "react"

export type RaterEntityRequest = {
    artistId: string
    albumId?: string
}   



export enum RaterStyle {
  GRID, LIST, LINEAR
}

export interface LinearRaterBaseModel  {
  id: string
  type: 'single'|'multiple'
  position: number
}
export interface LinearRaterItemModel extends LinearRaterBaseModel  {
  type: 'single'
  items:LinearRaterCircleModel[]
  score: number
}

export interface LinearRaterGroup extends LinearRaterBaseModel  {
  type: 'multiple'
  items: LinearRaterItemModel[] 
  scoreRange: { low: number, high: number} 
} 

export const isSingle =(linearModel:LinearRaterBaseModel): linearModel is LinearRaterItemModel  => linearModel.type === 'single' 
export const isMultiple = (linearModel:LinearRaterBaseModel): linearModel is LinearRaterGroup  => linearModel.type === 'multiple' 


export interface LinearRaterCircleModel {
  // song id
  id: string
  name: string 
} 
