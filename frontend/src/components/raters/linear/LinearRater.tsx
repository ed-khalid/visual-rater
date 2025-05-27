import { useEffect, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { FatSong } from "../../../models/CoreModels";
import { SONG_SCORE_DICTIONARY } from "../../../models/ScoreModels";
import { LinearRaterItem } from "./LinearRaterItem";
import { LinearRaterCircleModel, LinearRaterItemModel } from "../../../models/RaterModels";
import { LinearRaterContext } from "../../../providers/LinearRaterProvider";
import { mapSongScoreToUI } from "../../../functions/scoreUI";
import { select, selectAll } from "d3";
import './LinearRater.css'
import { Song } from "../../../generated/graphql";

const CATEGORIES = SONG_SCORE_DICTIONARY.values().map((it) => ({ label: it.category, color: it.color, stop: it.threshold.high  }) ).toArray().reverse()


interface Props {
    items: FatSong[]
    rowRefs: any[]
    onScoreUpdate: (updatedSong:Song) => void
}

export const LinearRater = ({items, onScoreUpdate}: Props) => {


  const unratedItems = items.filter(it => it.song.score === undefined || it.song.score === null)    
  const ratedItems = items.filter(it => it.song.score !== undefined && it.song.score !== null)

  const groupByScore = (items:FatSong[]) => {
    const scoreMap = new Map<number, FatSong[]>() 
    items.forEach((fatSong) => {
      const score = fatSong.song.score 
      const songsWithScore = scoreMap.get(score!)    
      if (songsWithScore) {
        scoreMap.set(fatSong.song.score!, [...songsWithScore, fatSong ] )
      } else {
        scoreMap.set(fatSong.song.score!, [fatSong] )
      }
    })
    return scoreMap.entries().map((entry, i) => ({ id: 'linear-rater-group-' + i, score: entry[0], items: entry[1].map((fatSong) =>  ({ id: fatSong.song.id, name: fatSong.song.name, nodeRef: null }) ) })).toArray()
  } 

  const groups:LinearRaterItemModel[] = groupByScore(ratedItems)   

  const containerRef = useRef<HTMLDivElement|null>(null)   
  const svgRef = useRef<SVGSVGElement|null>(null)   
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0})
  const [y, setY] = useState(0);
  const [mainlineX, setMainlineX] = useState(0)  

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        setContainerSize({width, height})
        setY(height/2)
        setMainlineX(width/2)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const { width, height} = containerSize

  const yToScore = scaleLinear<number>()  
  .domain([0, height])
  .range([100, 0])
  .clamp(true)

  const onDragEnd = (item:LinearRaterCircleModel, newScore:number) => {
    select("g.linear-rater-group").classed('dimmed', false)
    select(`g#linear-rater-item-${item.id}`).classed('selected', false)
    const song = items.map(it => it.song).find(it => it.id === item.id)  
    if (!song) throw `LinearRater: song ${item.id} not found in items!`
    onScoreUpdate({ ...song, score: newScore  })
  } 

  const onDragStart = (item:LinearRaterCircleModel) =>  {
    selectAll("g.linear-rater-group").classed('dimmed', true)
    select(`g#linear-rater-item-${item.id}`).classed('selected', true)
  } 

  const getScoreCategoryDetails = (score:number) => {
      const category = mapSongScoreToUI(score) 
      return  { color:  category.color, category: category.category } 
  } 


  return (
    <LinearRaterContext.Provider value={{ getScoreCategoryDetails, mainlineX: mainlineX , yToScore, raterHeight: height-5, onDragStart, onDragEnd }}>

    <div ref={containerRef} style={{ width: "100%", height: "100%", position: 'relative' }}>
        {height > 0 && <svg ref={svgRef} width={width} height={height-5}>
            <defs>
            <linearGradient id="rater-gradient" x1="0" y1="1" x2="0" y2="0">
              {CATEGORIES.map((cat, i) => (
                <stop
                  key={cat.label}
                  offset={`${cat.stop}%`}
                  stopColor={cat.color}
                />
              ))}
            </linearGradient>
            </defs>
            <rect x={mainlineX} y={20} width={20} height={height-5} fill="url(#rater-gradient)"  /> 
            {groups.map((group) => <LinearRaterItem item={group} />)}
      </svg>
        }
    </div>
    </LinearRaterContext.Provider>
  );
};
