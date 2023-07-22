import React from "react"
import { ComparisonSong, Song } from "../../../generated/graphql"
import './ComparisonSongs.css'

interface ComparisonSongsProps {
    songs:ComparisonSong[]
    songBeingDragged:Song
}


export const ComparisonSongs = ({songs,songBeingDragged}:ComparisonSongsProps) => {
    songs.sort((a,b) => (a.songScore > b.songScore ? -1 : a.songScore > b.songScore ? 1: 0))  
    return <React.Fragment>
       {songs && songBeingDragged && <svg id="comparison-songs-box" viewBox="20 0 35 35">
        {songs.map((it,i) => <ComparisonSongItem key={'comparison-item-'+i} item={it} mainlineX={50} y={ 5 + (i*10)  } ></ComparisonSongItem> )}
        </svg>}
    </React.Fragment>
} 

interface ComparisonSongItemProps {
    mainlineX:number
    item:ComparisonSong
    y:number
}
export const ComparisonSongItem = ({mainlineX, item, y}:ComparisonSongItemProps) => {
        const determineTextColor = (color:string|undefined|null) => {
            if (color === null || color === undefined) {
                return "black"
            }
            const arr = color.match(/^\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/) 
            if (arr) {
                        const r = Number(arr[1])
                        const g = Number(arr[2])
                        const b = Number(arr[3])
            // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
                    const hsp = Math.sqrt(
                    0.299 * (r * r) +
                    0.587 * (g * g) +
                    0.114 * (b * b)
                    );

                // Using the HSP value, determine whether the color is light or dark
                        if (hsp>127.5) {
                            return 'black';
                        } 
                        else {
                            return 'white';
                        }
            } else return 'black'
        } 

    const imageSize =  8
    const imageDimensions = {
        x: mainlineX  - imageSize/2 ,
        y: y -imageSize, 
        size: imageSize
    } 
    const songNameDimensions = {
        x: (imageDimensions.x) - 15,
        y: imageDimensions.y + imageDimensions.size/2      
    }  
    const songScoreDimensions = {
        x: songNameDimensions.x + imageDimensions.size/2 + 15,
        y: imageDimensions.y + imageSize/2   
    }  

    const color = "rgb" + item.albumDominantColor   
        return <g className="comparison-item"> 
                    <circle className="item-thumbnail-overlay" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2} fill={color} stroke={color}></circle>
                    <image fill={"rgba"+item.albumDominantColor} opacity={0.5} xlinkHref={item.thumbnail!} clipPath="inset(0% round 15px)" className="item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail!}/>
                    <text textAnchor="middle" className="item-name" fontSize={3} fill="black" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{item.songName}</text>
                    <text textAnchor="middle" className="item-score" fontSize={3.7} fontWeight="bold" fill={determineTextColor(item.albumDominantColor)} x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.songScore.toFixed(2)}</text>
               </g>

} 