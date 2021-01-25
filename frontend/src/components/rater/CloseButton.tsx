import React from "react";
import { Position } from "../../models/Position";

interface Props {
    onClick:any
    position:Position
}


export const CloseButton = ({onClick, position}:Props) => {
    const width = 20;
    return <g className="close-button" onClick={onClick} cursor="pointer" pointerEvents="stroke">
                              <line 
                                        x1={position.x-(width/2)} 
                                        y1={position.y-6}
                                        x2={position.x-(width/2)-5}
                                        y2={position.y}
                                        stroke="#3d3d3d"
                              > 
                              </line>
                              <line 
                                        x1={position.x-(width/2)-5} 
                                        y1={position.y-6}
                                        x2={position.x-(width/2)}
                                        y2={position.y}
                                        stroke="#3d3d3d"
                              > 
                            </line>
            </g>
}