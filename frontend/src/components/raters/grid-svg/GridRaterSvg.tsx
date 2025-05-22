import { useEffect, useRef, useState } from "react";
import { mapSongToUIItem } from "../../../functions/mapper";
import { useUpdateSongMutation } from "../../../generated/graphql";
import { SongUIItem } from "../../../models/ItemTypes";
import { FatSong } from "../../../models/RaterTypes";
import './GridRaterSvg.css'

interface Props {
    items: FatSong[] 
}

export const GridRaterSvg = ({items}:Props) => {

    const cellWidth =  90
    const cellHeight = 50
    const [updateSong]  = useUpdateSongMutation();
    const svgRef = useRef<SVGSVGElement>(null) 
    const [scale, setScale]= useState<number>(1)
    const [translate, setTranslate] = useState<{x:number, y:number}>({x:0, y:0})
    const [zoomCenter, setZoomCenter] = useState<{x:number, y:number}>({x:0, y:0})
    const [viewbox, setViewbox] = useState<string>(`0 0 ${10 * cellWidth} ${10 * cellHeight} `)

    const resetZoom = () => {
        setScale(1)
        setTranslate({x:0, y:0})
        setViewbox(`0 0 ${10 * cellWidth} ${10 * cellHeight} `)
    }

    const handleDoubleClick = (row:number, col:number) => {
        const cellCenterX = col * cellWidth + cellWidth / 2;
        const cellCenterY = row * cellHeight + cellHeight / 2;
        // Store zoom center for transform calculations
        setZoomCenter({ x: cellCenterX, y: cellCenterY });
        setScale(scale+2); // Zoom level
        // const newViewbox = `${col * cellWidth - 20} ${row * cellHeight -20 } ${cellWidth} ${cellHeight}`
        // setViewbox(newViewbox)
    }

    useEffect(() => {
        const svg = svgRef.current 
        if (!svg) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()

            const zoomIntensity = 0.1;
            const delta = e.deltaY < 0 ? 1 : -1;
            const newScale = Math.min(0.5, scale + delta * zoomIntensity, 10);

            const rect = svg.getBoundingClientRect()
            const offsetX = e.clientX - rect.left 
            const offsetY = e.clientY - rect.top

            const svgX = (offsetX - translate.x) / scale
            const svgY = (offsetY - translate.y) / scale

            const newTranslateX = offsetX - svgX * newScale 
            const newTranslateY = offsetY - svgY * newScale

            setScale(newScale)
            setTranslate({x: newTranslateX, y: newTranslateY})

        }

        svg.addEventListener('wheel', handleWheel, { passive: false })
        return () => svg.removeEventListener('wheel', handleWheel)
    }, [scale, translate])

    const groupByScore = (items:FatSong[]) => {
        const songs = items.map(it => mapSongToUIItem(it.song, it.album, it.artist))
        const retv:Record<number, SongUIItem[]|undefined> = {}  
        for (const song of songs) {
            const score = song.score
            if (!retv[score]) {
                retv[score] = [] 
            } 
            retv[score].push(song) 
        }
        return retv
    }    
    const unratedItems = items.filter(it => !!!(it.song.score))  
    const ratedItems = items.filter(it => !!(it.song.score)) 
    const itemsByScore = groupByScore(ratedItems) 
    var cellNumber = 99  
    const grid = [] 
    for (let row = 0; row < 10; row++)  {
        for (let col = 0; col< 10; col++) {
            const x = col * cellWidth 
            const y = row * cellHeight
            grid.push(
                <g key={`cell-${cellNumber}`}
                >
                    <rect
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    fill="none"
                    stroke="white"
                    />
                    <text
                    x={x + cellWidth / 2}
                    y={y + cellHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    onDoubleClick={() => handleDoubleClick(row, col)}
                    >
                        {cellNumber}
                    </text>
                </g> 
            )
            cellNumber = cellNumber - 1
        }

    } 

    return <>
    <button id="grid-rater-zoom-reset"  onClick={()=>resetZoom()} />
    <svg ref={svgRef} id="grid-rater-svg" viewBox={viewbox} preserveAspectRatio="xMinYMin meet">
    <g
    transform={`
      translate(${translate.x} ${translate.y})
      scale(${scale})
    `}
    style={{ transition: 'transform 0.1s ease-in-out' }}
  >
    {grid}
  </g>
    </svg> 
    </>
    

}