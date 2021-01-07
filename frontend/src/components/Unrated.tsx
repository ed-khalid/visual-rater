import { Item, ItemType } from "../models/Item";
import { Position } from "../models/Position";
import React, {  useState, useEffect, Dispatch, SetStateAction } from "react";
import './Unrated.css';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { event as d3Event } from 'd3'
import { RatedItem } from "../models/RatedItem";
import { Scaler } from "../functions/scale";
import { GetArtistsDocument, NewSongInput, Song, useCreateSongMutation } from "../generated/graphql";
import { NewSong } from "../models/music/Song";
import { AppConstants } from "../App";


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


    const raterPosition = AppConstants.rater.position

    const [g,updateG] = useState<SVGElement|null>(null); 
    const [createSong, createSongResult ]  = useCreateSongMutation();
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
    useEffect(() => {
        select(g).selectAll<SVGElement,any>('g').call(drag<any,any>()
            .on('start', dragStart)
            .on('drag', dragInProgress)
            .on('end', dragEnd)
          )
    })
    useEffect(() => {
        if (createSongResult.data) {
            const newSong = createSongResult.data.CreateSong  
            if (newSong) {
              const ratedItem = new RatedItem({id: newSong.id, name: newSong.name }, newSong.score); 
              const updateRated = updateItems[1]; 
              updateRated([...ratedItems, ratedItem ]);
            }
        }
    }, [createSongResult.data])


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
    const aboveRater = (x:number) =>  x > raterPosition.x-10 && x < raterPosition.x+10;  

    const dragStart = function(datum:any, i:number, nodeList:ArrayLike<SVGElement>) {
          onDrag(unratedItems[i]);
          const g = nodeList[i];  
          const d3Rect = select(g).select('rect');  
          const d3Title = select(g).select('text#title');
          const d3TrackNumber = select(g).select('text#trackNumber');
          dragOriginalPos.rect = {
              x: Number(d3Rect.attr('x')),
              y: Number(d3Rect.attr('y'))
          }
          dragOriginalPos.title = {
              x: Number(d3Title.attr('x')),
              y: Number(d3Title.attr('y'))
          }
          dragOriginalPos.trackNumber = {
              x: Number(d3TrackNumber.attr('x')),
              y: Number(d3TrackNumber.attr('y'))
          }
          dragDelta.rect = {
              x : Number(d3Rect.attr('x')) - d3Event.x,
              y : Number(d3Rect.attr('y')) - d3Event.y  
          }
          dragDelta.title = {
              x : Number(d3Title.attr('x')) - d3Event.x,
              y : Number(d3Title.attr('y')) - d3Event.y  
          }
          dragDelta.trackNumber = {
              x : Number(d3TrackNumber.attr('x')) - d3Event.x,
              y : Number(d3TrackNumber.attr('y')) - d3Event.y  
          }
          d3Rect.raise().classed("active", true);
    }


    const dragInProgress = (datum:SVGRectElement, i:number, nodes:ArrayLike<SVGElement>) => {
            const g = nodes[i];  
            const rect = select(g).select('rect')
                  rect
                     .attr("x", d3Event.x + dragDelta.rect.x )
                     .attr("y", d3Event.y + dragDelta.rect.y)
                     .attr("width", 5)
                     .attr("height",5)
                     .attr("rx",10)
                     .attr("ry",10)
                     ;
            const title = select(g).selectAll('text#title'); 
            const number = select(g).selectAll('text#trackNumber'); 
            title.attr("x", d3Event.x + dragDelta.title.x).attr("y", d3Event.y+dragDelta.title.y);
            number.attr("x", d3Event.x + dragDelta.trackNumber.x).attr("y", d3Event.y+dragDelta.trackNumber.y);
            aboveRater(Number(rect.attr("x"))) ? onRater(true): onRater(false); 
    }

    const dragEnd = (datum:SVGRectElement, i:number, nodes:ArrayLike<SVGElement>) => { 
          const d = nodes[i]; 
          onRater(false);
          const title = select(d).selectAll('text#title'); 
          const trackNumber = select(d).selectAll('text#trackNumber'); 
          const rect = select(d).select('rect'); 
          if (aboveRater(Number(rect.attr('x')))) {
              const item = unratedItems[i];  
              const yPosition = Number(rect.attr('y'));    
              const score = scaler.toScore(yPosition);   
              putSongOnRater(item, score )
          } else {
            title
              .attr('x', dragOriginalPos.title.x)
              .attr('y', dragOriginalPos.title.y)
              .classed("active", false)
              ;
            trackNumber
              .attr('x', dragOriginalPos.trackNumber.x)
              .attr('y', dragOriginalPos.trackNumber.y)
              .classed("active", false)
              ;
              rect
                    .attr('x', dragOriginalPos.rect.x)
                    .attr('y', dragOriginalPos.rect.y)
                    .attr("width", "15%")
                    .attr("height",50)
                    .attr("rx",5)
                    .attr("ry",5)
                    .classed("active", false);
          }
    } 
    const putSongOnRater = (item:Item, score:number) => {
              const updateUnrated = updateItems[0]; 
              const newUnrated = unratedItems.filter(it => it !==  item );  
              updateUnrated(newUnrated);  
              switch(itemType) {
                    case ItemType.MUSIC :
                    const asNewSong = item as unknown as NewSong   
                    const song:NewSongInput = {
                            vendorId: asNewSong.vendorId,
                            score,
                            number: asNewSong.number,
                            discNumber: asNewSong.discNumber,
                            name: asNewSong.name,
                            artist:  {
                                vendorId: asNewSong.artist.id,
                                name: asNewSong.artist.name,
                                thumbnail: asNewSong.artist.thumbnail
                            }
                    }  
                    if (asNewSong.album ) {
                        song.album = {
                            vendorId: asNewSong.album.id,
                            name: asNewSong.album.name,
                            thumbnail: asNewSong.album.thumbnail,
                            year: asNewSong.album.year
                        }
                    }
                    createSong(
                        {
                            variables: { song }, 
                            refetchQueries: [{query: GetArtistsDocument }] 
                        }
                    )
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
