import { Song, Artist, Album } from "./music";
import { Item } from "./Item";

const metallica = new Artist(1+'', 'Metallica'); 
const masterOfPuppets = new Album(1+'', 'Master of Puppets', metallica);   

export const initialModel:Item[] = ['Battery', 
 'Master Of Puppets', 
 'The Thing That Should Not Be', 
 '(Welcome Home) Sanitarium', 
 'Disposable Heroes', 
 'Leper Messiah', 
 'Orion', 
 'Damage Inc.'
].map((it,i) => new Song(i+1+'',i+1, it, metallica , masterOfPuppets));