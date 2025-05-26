import React from "react"
import './ComparisonSongs.css'
import { ComparisonSongUIItem } from "../../../../models/CoreModels"

interface ComparisonSongsProps {
    songs:ComparisonSongUIItem[]
}


export const ComparisonSongs = ({songs}:ComparisonSongsProps) => {
    const orderedAndPositionedSongs = songs.sort((a,b) => (a.score > b.score ? -1 : a.score > b.score ? 1: 0)).map((it,i) => ({...it, y: 5+(i*10)  }) )  
    const mainSong = orderedAndPositionedSongs.find(it => it.isMain)  
    return <React.Fragment>
       {orderedAndPositionedSongs && mainSong && <svg viewBox={`20 ${mainSong?.y - 25} 35 35`}>
        { orderedAndPositionedSongs.length > 1 && orderedAndPositionedSongs.map((it,i) => <ComparisonSongItem key={'comparison-item-'+it.id} item={it} mainlineX={50} y={it.y} ></ComparisonSongItem> )}
        { orderedAndPositionedSongs.length === 1 && <text fontSize={2} x={20} y={mainSong.y-5}>{mainSong.artistName} has no other albums to compare</text> }
        </svg>}
    </React.Fragment>
} 

interface ComparisonSongItemProps {
    mainlineX:number
    item:ComparisonSongUIItem
    y:number
}
export const ComparisonSongItem = ({mainlineX, item, y}:ComparisonSongItemProps) => {
        const determineTextColor = (color:string|undefined|null) => {
            if (color === null || color === undefined) {
                return "black"
            }
            const arr = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/) 
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
        y: imageDimensions.y + (imageDimensions.size/2  - 2)   
    }  
    const artistNameDimensions = {
        x: (imageDimensions.x) - 15,
        y: imageDimensions.y + (imageDimensions.size/2)   
    }
    const albumNameDimensions = {
        x: (imageDimensions.x) - 15,
        y: imageDimensions.y + (imageDimensions.size/2) + 2   
    }
    const songScoreDimensions = {
        x: songNameDimensions.x + imageDimensions.size/2 + 15,
        y: imageDimensions.y + imageSize/2   
    }  

    const color = "rgb(" + item.overlay  + ")"
        return <g cursor={"pointer"} className="comparison-item"> 
        <rect x={0} y={imageDimensions.y-1} opacity={0.5} width={100} height={10} fill={item.isMain? "yellow": "gray"} stroke="black" strokeWidth={0.2}></rect>
                    <circle className=" comparison-item item-thumbnail-overlay" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2} fill={color} stroke={color}></circle>
                    <image fill={"rgba("+item.overlay+")"} opacity={0.5} xlinkHref={item.thumbnail!} clipPath="inset(0% round 15px)" className="comparison-item item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail!}/>
                    <text textAnchor="middle" className="comparison-item item-name" fontSize={2} fill="black" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{item.name}</text>
                    <text textAnchor="middle" fontStyle="italic" className="comparison-item artist-name" fontSize={1.7} fill="black" x={artistNameDimensions.x} y={artistNameDimensions.y} dy=".35em">{item.artistName}</text>
                    <text textAnchor="middle" fontStyle="italic" className="comparison-item album-name" fontSize={1.7} fill="black" x={albumNameDimensions.x} y={albumNameDimensions.y} dy=".35em">{item.albumName}</text>
                    <text textAnchor="middle" className="comparison-item item-score" fontSize={3.7} fontWeight="bold" fill={determineTextColor(color)} x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.score.toFixed(2)}</text>
               </g>

} 