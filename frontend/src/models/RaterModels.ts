import { Ref } from "react"

export type RaterEntityRequest = {
    artistId: string
    albumId?: string
}   

export enum RaterStyle {
  GRID, LIST, LINEAR
}

export type LinearRaterCircleModel = {
  // song id
  id: string
  name: string 
  nodeRef: Ref<SVGCircleElement|null>
}

export type LinearRaterItemModel = {
  id: string
  score:number
  items:LinearRaterCircleModel[]
}