

export default class Song {

    constructor(title:string, score:number, artist:string, album:string) {
        this.title= title; 
        this.score = score ? score : 0;
        this.artist = artist;
        this.album = album;
    }

    title:string;
    artist:string;
    album:string;

    score:number;
}