import { Item, ItemType } from "../models/Item";
import { Position } from "../models/Position";
import React, {  useState, useEffect, Dispatch, SetStateAction } from "react";
import './Unrated.css';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { event as d3Event } from 'd3'
import { RatedItem } from "../models/RatedItem";
import { Scaler } from "../functions/scale";
import { useCreateSongMutation } from "../generated/graphql";
import { NewSong } from "../models/music/Song";


interface Props {
    unratedItems:Item[];
    ratedItems:RatedItem[];
    onDrag:Dispatch<SetStateAction<Item|undefined>>;
    onRater:Dispatch<SetStateAction<boolean>>;
    updateItems:any[];
    scaler:Scaler;
    itemType:ItemType;
}

export const Unrated:React.FunctionComponent<Props> = ({unratedItems,ratedItems,onDrag,onRater, updateItems, scaler,itemType}:Props) => {

    const [g,updateG] = useState<SVGElement|null>(null); 
    const [createSong, createSongResult ]  = useCreateSongMutation();

    useEffect(() => {
        attachDragEvents();
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


    let dragOriginalPos:{rect:Position, text:Position} = {
        rect : {
            x:0
            ,y:0
        }
        ,text: {
            x:0
            ,y:0
        }
    };
    let dragDelta:{rect:Position,text:Position}= {
        rect: {
            x:0 
            ,y:0
        }
        ,text: {
            x:0 
            ,y:0
        }
    } 
    
    const calculateY = (index:number) => 10 + (50*index) + (12*index); 
    const aboveRater = (x:number) =>  x > 490 && x < 510;  

    const dragStart = function(datum:any, i:number, nodeList:ArrayLike<SVGElement>) {
          onDrag(unratedItems[i]);
          const g = nodeList[i];  
          const d3Rect = select(g).select('rect');  
          const d3Text = select(g).select('text');
          dragOriginalPos.rect = {
              x: Number(d3Rect.attr('x')),
              y: Number(d3Rect.attr('y'))
          }
          dragOriginalPos.text = {
              x: Number(d3Text.attr('x')),
              y: Number(d3Text.attr('y'))
          }
          dragDelta.rect = {
              x : Number(d3Rect.attr('x')) - d3Event.x,
              y : Number(d3Rect.attr('y')) - d3Event.y  
          }
          dragDelta.text = {
              x : Number(d3Text.attr('x')) - d3Event.x,
              y : Number(d3Text.attr('y')) - d3Event.y  
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
            const text = select(g).select('text'); 
            text.attr("x", d3Event.x + dragDelta.text.x).attr("y", d3Event.y+dragDelta.text.y);
            console.log(`x: ${rect.attr('x')} y: ${rect.attr('y')}`)
            aboveRater(Number(rect.attr("x"))) ? onRater(true): onRater(false); 
    }

    const dragEnd = (datum:SVGRectElement, i:number, nodes:ArrayLike<SVGElement>) => { 
          const d = nodes[i]; 
          onRater(false);
          const text = select(d).select('text'); 
          const rect = select(d).select('rect'); 
          if (aboveRater(Number(rect.attr('x')))) {
              const item = unratedItems[i];  
              const updateUnrated = updateItems[0]; 
              const newUnrated = unratedItems.filter(it => it !==  item );  
              const yPosition = Number(rect.attr('y'));    
              const score = scaler.toScore(yPosition);   
              updateUnrated(newUnrated);  
                switch(itemType) {
                    case ItemType.MUSIC :
                    const asNewSong = item as NewSong   
                    createSong({variables: {song: { vendorId: asNewSong.vendorId, score, name: asNewSong.name , album: asNewSong.album, artist: asNewSong.artist   }  }})
                }
          } else {
            text
              .attr('x', dragOriginalPos.text.x)
              .attr('y', dragOriginalPos.text.y)
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

    const attachDragEvents = () => {
        if (g == null) {
            return;
        }
        select(g).selectAll<SVGElement,any>('g').call(drag<any,any>()
            .on('start', dragStart)
            .on('drag', dragInProgress)
            .on('end', dragEnd)
          )
    }

    return(
        <g ref={node => updateG(node)} >
       {unratedItems.map( (it,i) => { 
            return <g id={i+''} key={'track'+it.name}>
                     <rect cursor="move" rx="5" ry="5" stroke="white" fill="#000" fillOpacity="0.0" className="draggable" width="15%" height="50" x="10" y={calculateY(i)} ></rect>
                     <text fontSize="8" fontSizeAdjust="2" cursor="move" textAnchor="middle" fill="white" dy=".35em"  x="70" y={calculateY(i)+25}>{it.name}</text>
                   </g>
        })}
    </g>
    );


} 
