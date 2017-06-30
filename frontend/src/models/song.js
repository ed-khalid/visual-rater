

export default class Song {

    constructor(title, score) {
        this.title= title; 
        this.score = score ? score : 0;
    }

    title;
    score;
}