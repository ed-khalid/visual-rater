import { Item } from "../Item";
import { Artist,Album } from '.';

export class Song extends Item {

    constructor(public id:string, public trackNumber:number, public name:string, public artist:Artist, public album?:Album) {
        super(id,name, (album)? album.id : artist.id )
    }

} 