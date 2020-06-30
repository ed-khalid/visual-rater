import { Item } from "./Item";



export class Song extends Item {

    constructor(public title:string, public artist:string, public album?:string) {
        super(title);
    }

} 
