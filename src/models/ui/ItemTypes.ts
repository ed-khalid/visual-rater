import { Ref } from 'react';
import { Maybe } from '../../generated/graphql';
import { Item, RatedItem } from '../domain/ItemTypes';
import { RaterOrientation } from './RaterTypes'



export type RaterTier = number


export interface RaterItemUI {
    orientation:RaterOrientation,
    tier:RaterTier
}



export class RatedMusicItemUI extends RatedItem implements RaterItemUI {
    public constructor(item:Item, 
        public score:number, 
        public thumbnail:string, 
        public orientation:RaterOrientation,
        public tier:RaterTier ,
        public nodeRef:any, 
        public overlay:Maybe<string>|undefined,
        ) {
        super(item, score);
    }
} 

export class RatedSongItemUI extends RatedMusicItemUI {
    public constructor(item:Item, public score:number, public thumbnail:string, public orientation:RaterOrientation, public tier:RaterTier, public overlay:Maybe<string>|undefined,
        public number:number, 
        public nodeRef:any, 
        public albumName:string
        ) {
         super(item, score, thumbnail, orientation, tier, nodeRef, overlay)
    }

} 
