import { Maybe } from '../../generated/graphql';
import { Item, RatedItem } from '../domain/ItemTypes';
import { RaterOrientation } from './RaterTypes'

export type RaterTier = number

export interface RaterItemUI {
    orientation:RaterOrientation,
    tier:RaterTier
}

export class ComparisonSongUIItem {
    public constructor(public id:string, public name:string,public score:number,public isMain:boolean, public artistName:string, public albumName:string, public albumThumbnail?:string, public overlay?:string) {

    }
}  

export class RatedMusicItemUI extends RatedItem {
    public constructor(item:Item, 
        public score:number, 
        public thumbnail:string, 
        public tier:RaterTier ,
        public nodeRef:any, 
        public overlay:Maybe<string>|undefined,
        public orientation?:RaterOrientation,
        ) {
        super(item, score);
    }
} 

export class RatedSongItemUI extends RatedMusicItemUI {
    public constructor(item:Item, public score:number, public thumbnail:string, public tier:RaterTier, public overlay:Maybe<string>|undefined,
        public number:number, 
        public nodeRef:any, 
        public albumName:string,
        public artistName:string, 
        public orientation?:RaterOrientation
        ) {
         super(item, score, thumbnail, tier, nodeRef, overlay, orientation)
    }

} 
