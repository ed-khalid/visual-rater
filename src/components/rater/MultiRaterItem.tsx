import React from "react";
import { Scaler } from "../../functions/scale";
import './MultiRaterItem.css'
import { SingleRaterItem } from "./SingleRaterItem";
import { RatedSongItemGrouped, RaterOrientation } from "../../models/ui/RaterTypes";
import { ANIMATION_DURATION } from "../../models/ui/Animation";
import { Transition, TransitionGroup } from "react-transition-group";

interface MultiRaterItemProps {
    group:RatedSongItemGrouped
    orientation:RaterOrientation
    isReadonly:boolean
    scaler:Scaler
    mainlineX:number
    onDragEnd?:any
    onClick?:any
} 

export const MultiRaterItem = ({group, onDragEnd, onClick, isReadonly, mainlineX, orientation, scaler }:MultiRaterItemProps) =>  {

    const itemDefaultStyle = {
        opacity: 0,
        transition: `opacity ${ANIMATION_DURATION}ms ease-in-out`
    } 
    const itemTransitionStyles= {
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 },
        unmounted: {}
    }

       return <g className="groupedItems">
        <TransitionGroup compponent={null}>
            {group.items.map((item,i) => 
            <Transition key={'item'+item.id} in={true} nodeRef={item.nodeRef} timeout={ANIMATION_DURATION}>
            { transitionState => (
            <g key={'multirater-item-g' + item.id}>
            <SingleRaterItem
              item={item}
              style={{...itemDefaultStyle, ...itemTransitionStyles[transitionState]}}
              nodeRef={item.nodeRef}
              shouldDrawScoreline={ i === group.items.length-1}
              isReadonly={isReadonly}
              onClick={onClick}
              orientation={orientation}
              mainlineX={mainlineX}
              scaler={scaler}
              onDragEnd={onDragEnd}
             />
            </g>
                )}
             </Transition>
        )}
        </TransitionGroup>
    </g> 
}