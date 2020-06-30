import { Song } from "./Song";

export const initialModel = ['Battery', 
 'Master Of Puppets', 
 'The Thing That Should Not Be', 
 '(Welcome Home) Sanitarium', 
 'Disposable Heroes', 
 'Leper Messiah', 
 'Orion', 
 'Damage Inc.'
].map(it => new Song(it, 'Metallica', 'Master of Puppets'))