


export abstract class Item {

    constructor(public id:string, public name:string, public parentId:string) {

    }
}

export enum ItemType {
    MUSIC
}
