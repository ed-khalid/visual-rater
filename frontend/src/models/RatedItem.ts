import { Item } from './Item';

export class RatedItem extends Item {
    public constructor(item:Item, public score:number) {
        super(item.id, item.name, item.vendorId);
    }
} 

