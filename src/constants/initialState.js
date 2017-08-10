import Song  from '../models/song'
export const initialSongs =  
  ['Battery'
  ,'Master of Puppets'
  ,'The Thing That Should Not Be'
  ,'Welcome Home (Sanitarium)'
  ,'Disposable Heroes'
  ,'Leper Messiah'
  ,'Orion'
  ,'Damage, Inc.'
  ].map(it => new Song(it))
export const currentArtist = 'Metallica'
export const currentAlbum = 'Master of Puppets'