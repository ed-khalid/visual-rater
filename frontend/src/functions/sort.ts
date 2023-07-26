import { RatedItem } from "../models/domain/ItemTypes";



export const sortByScore = <T extends RatedItem> (items:T[]) => {

    return items.sort((a,b) => {
        if (a.score < b.score) {
            return 1
        } else if (a.score > b.score) {
            return -1
        } else {
            return 0
        }
    }) 
}