export abstract class Item {

    constructor(public id:string, public name:string, public vendorId?:string|null) {

    }
}

export enum ItemType {
    MUSIC
}
