import { RaterOrientation } from '../components/rater/Rater';
import { Item } from './Item';

export class RatedItem extends Item {
    public constructor(item:Item, public score:number) {
        super(item.id, item.name);
    }
} 

export class RatedSongItem extends RatedItem {
    public constructor(item:Item, 
        public score:number, 
        public thumbnail:string, 
        public number:number, 
        public artistName:string, 
        public albumName:string, 
        public orientation:RaterOrientation
        ) {
        super(item, score);
    }
} 

