export abstract class Item {

    constructor(public id:string, public name:string, public data?:ItemData) {

    }
}

export interface ItemData {

}

export enum ItemType {
    MUSIC
}
