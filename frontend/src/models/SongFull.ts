

export type SongFull = {
    id:string,
    name:string,
    number:number,
    score:number,
    artist: {
        id:string,
        name:string,
        thumbnail?:string
    },
    album: {
        id: string,
        name: string,
        thumbnail?:string
    }
}