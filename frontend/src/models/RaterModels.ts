
export type RaterEntityRequest = {
    artistId: string
    albumId?: string
}   

export enum RaterStyle {
  GRID, LIST, CARTESIAN
}