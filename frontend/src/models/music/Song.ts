import { SearchResult } from "../../generated/graphql";
import { Item } from "../Item";

export class Song extends Item {

    constructor(public id:string, public trackNumber:number, public name:string, public artist:SearchResult, public album?:SearchResult) {
        super(id,name )
    }

} 