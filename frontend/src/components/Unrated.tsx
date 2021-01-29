import { Item, ItemType } from "../models/Item";
import { Position } from "../models/Position";
import React, {  useState, useEffect, Dispatch, SetStateAction } from "react";
import './Unrated.css';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { event as d3Event } from 'd3'
import { RatedItem } from "../models/RatedItem";
import { Scaler } from "../functions/scale";
import { GetArtistsDocument, NewSongInput, Song } from "../generated/graphql";


interface Props {
    unratedItems:Item[];
    ratedItems:RatedItem[];
    onDrag:Dispatch<SetStateAction<Item|undefined>>;
    onRater:Dispatch<SetStateAction<boolean>>;
    updateItems:any[];
    pageSize:number;
    pageNumber:number;
    scaler:Scaler;
    itemType:ItemType;
}

export const Unrated:React.FunctionComponent<Props> = ({unratedItems, pageSize, pageNumber, ratedItems,onDrag,onRater, updateItems, scaler,itemType}:Props) => {

    const [g,updateG] = useState<SVGElement|null>(null); 
    // const [createSong, createSongResult ]  = useCreateSongMutation();
    const determineItemsToDisplay = (unratedItems:Item[]) => {
        let offset = pageSize -1
        // default
        let start = 0; 
        let end = Math.min(offset,unratedItems.length)
        if (pageNumber > 1) {
            start = offset * (pageNumber-1)
            end =  Math.min(offset * (pageNumber-1) * 2, unratedItems.length)
        }
        return unratedItems.slice(start,end); 
    }    
    // useEffect(() => {
    //     if (createSongResult.data) {
    //         const newSong = createSongResult.data.CreateSong  
    //         if (newSong) {
    //           const ratedItem = new RatedItem({id: newSong.id, name: newSong.name }, newSong.score); 
    //           const updateRated = updateItems[1]; 
    //           updateRated([...ratedItems, ratedItem ]);
    //         }
    //     }
    // }, [createSongResult.data])


    let dragOriginalPos:{rect:Position, title:Position, trackNumber: Position} = {
        rect : {
            x:0
            ,y:0
        }
        ,title: {
            x:0
            ,y:0
        }
        ,trackNumber : {
            x:0
            ,y:0
        }
    };
    let dragDelta:{rect:Position,title:Position, trackNumber:Position}= {
        rect: {
            x:0 
            ,y:0
        }
        ,title: {
            x:0 
            ,y:0
        }
        ,trackNumber: {
            x:0 
            ,y:0
        }
    } 
    
    const calculateY = (index:number) =>  1 + (50*index) + (12*index); 

    const putSongOnRater = (item:Item, score:number) => {
              const updateUnrated = updateItems[0]; 
              const newUnrated = unratedItems.filter(it => it !==  item );  
              updateUnrated(newUnrated);  
              switch(itemType) {
                    case ItemType.MUSIC :
                    const asNewSong = item    
                    // const song:NewSongInput = {
                    //         vendorId: asNewSong.vendorId,
                    //         score,
                    //         number: asNewSong.number,
                    //         discNumber: asNewSong.discNumber,
                    //         name: asNewSong.name,
                    //         artist:  {
                    //             vendorId: asNewSong.artist.id,
                    //             name: asNewSong.artist.name,
                    //             thumbnail: asNewSong.artist.thumbnail
                    //         }
                    // }  
                    // if (asNewSong.album ) {
                    //     song.album = {
                    //         vendorId: asNewSong.album.id,
                    //         name: asNewSong.album.name,
                    //         thumbnail: asNewSong.album.thumbnail,
                    //         year: asNewSong.album.year
                    //     }
                    // }
                    // createSong(
                    //     {
                    //         variables: { song }, 
                    //         refetchQueries: [{query: GetArtistsDocument }] 
                    //     }
                    // )
    }}
    const wrap = (title:string) : string => {
        if (title.length > 23 ) {
            return title.slice(0,20) + '...'
        }
        return title
    }

    return(
        <g ref={node => updateG(node)} >
       {determineItemsToDisplay(unratedItems).map( (it,i) => { 
            return <g onDoubleClick={()=> putSongOnRater(it, 3) } id={i+''} key={'track'+it.id}>
                     <rect cursor="move" rx="5" ry="5" stroke="#3d3d3d" fill="#000" fillOpacity="0.0" className="draggable" width="15%" height="50" x="10" y={calculateY(i)} ></rect>
                     <text id="trackNumber" fontSize="50" fontSizeAdjust="2" cursor="move" textAnchor="middle" fill="#3d3d3d" fillOpacity="0.3" dy=".35em"  x="40" y={calculateY(i)+25}>{(it as Song).number}</text>
                     <text id="title" fontSize="8" fontSizeAdjust="2" cursor="move" textAnchor="middle" fill="#3d3d3d" dy=".35em"  x="70" y={calculateY(i)+25}>{wrap(it.name)}</text>
                   </g>
        })}
    </g>
    );


} 
