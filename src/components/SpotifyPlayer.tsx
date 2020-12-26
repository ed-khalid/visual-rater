import React from "react"
import './SpotifyPlayer.css'



export const SpotifyPlayer =  ({albumId}:{albumId:string|undefined}) => {

        return (albumId)
        ?
          <iframe id="spotify-player" src={"https://open.spotify.com/embed/album/"+ (albumId)  } width="250" height="380" frameBorder="0" allowTransparency={true} allow="encrypted-media"></iframe> 
        : <div></div> 

}  