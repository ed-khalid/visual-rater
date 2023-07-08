import { RaterOrientation } from '../../components/rater/Rater';
import { Item, RatedItem } from '../domain/ItemTypes';



export type RaterTier = number


export interface RaterItemUI {
    orientation:RaterOrientation,
    tier:RaterTier
}

export class RatedSongItemUI extends RatedItem implements RaterItemUI {
    public constructor(item:Item, 
        public score:number, 
        public thumbnail:string, 
        public number:number, 
        public artistName:string, 
        public albumName:string, 
        public orientation:RaterOrientation,
        public tier:RaterTier 
        ) {
        super(item, score);
    }
} 

