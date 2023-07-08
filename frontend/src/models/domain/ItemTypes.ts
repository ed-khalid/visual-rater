export enum ItemType {
    MUSIC
}
export abstract class Item {

    constructor(public id:string, public name:string) {

    }
}
export class RatedItem extends Item {
    public constructor(item:Item, public score:number) {
        super(item.id, item.name);
    }
} 