import { Album, Artist } from "../../generated/graphql";
import { Item, ItemData } from "../Item";

export class Song extends Item {

    public data:SongData;

    constructor(public id:string, public name:string, artist:Artist, album?:Album, number?:number, public score?:number) {
        super(id,name, {number,artist,album} )
        this.data = {number,artist,album};
    }

} 

export interface SongData extends ItemData {
    number?:number;  
    artist:Artist;
    album?:Album;
}    