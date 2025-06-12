import { useEffect, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { SONG_SCORE_DICTIONARY, UNRATED_COLOR } from "../../../models/ScoreModels";
import { LinearRaterContext } from "../../../providers/LinearRaterProvider";
import { mapSongScoreToUI } from "../../../functions/scoreUI";
import { select, selectAll } from "d3";
import './LinearRater.css'
import { Song } from "../../../generated/graphql";
import { LinearRaterConfig } from "../../../models/LinearRaterConfig";
import { LinearRaterItem } from "./LinearRaterItem";
import { LinearRaterGroupItem } from "./LinearRaterGroupItem";
import { UnratedLinearRaterItem } from "./UnratedLinearRaterItem";
import { LinearRaterModelMaker } from "./LinearRaterModelMaker";
import { SongTooltip } from "./SongTooltip";
import { isMultiple, isSingle, LinearRaterCircleModel } from "../../../models/LinearRaterModels";

const CATEGORIES = SONG_SCORE_DICTIONARY.values().filter(it => it.category !== 'UNRATED').map((it) => ({ label: it.category, color: it.color, stop: it.threshold.high  }) ).toArray().reverse()


interface Props {
    isSingleMode?: boolean
    items: Song[]
    rowRefs: any[]
    onScoreUpdate: (updatedSong:Song) => void
}

type HoveredSong = {
    song:Song
    position: {x:number,y:number}
}

export const LinearRater = ({items, onScoreUpdate, isSingleMode}: Props) => {

  const containerRef = useRef<HTMLDivElement|null>(null)   
  const svgRef = useRef<SVGSVGElement|null>(null)   
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0})
  const timeoutRef = useRef<number|undefined>(null)
  const config = LinearRaterConfig.rater
  const unratedConfig = LinearRaterConfig.unrated
  const [hovered, setHovered] = useState<HoveredSong|null>(null)

  const onCircleHover = (circleModel?:LinearRaterCircleModel, position?:{x:number,y:number}) => {
      if (!circleModel || !position) {
              setHovered(null)
          return
      }
      else {
          if (timeoutRef.current) {
              window.clearTimeout(timeoutRef.current)
              timeoutRef.current = undefined
          }
          const song  = items.find(it => it.id === circleModel?.id)
          if (!song) throw "LinearRater: song not found "
          setHovered({ song, position })
      }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        setContainerSize({width, height})
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const { width, height} = containerSize

  const raterHeight = height - config.heightOffset

  const yToScore = scaleLinear<number>()  
  .domain([0, raterHeight])
  .range([100, 0])
  .clamp(true)

  const modelMaker = new LinearRaterModelMaker(items, yToScore)   
  const { groups, largestGroupItemCount, unratedGroup } = modelMaker.groupByScore().groupByProximity(LinearRaterConfig.groupProximityThreshold).groupByProximity(30).getFinalValues()
  console.log('largestGroupItemCount', largestGroupItemCount)

  const onDragEnd = (item:LinearRaterCircleModel, newScore:number) => {
    selectAll("g.linear-rater-group").classed('dimmed', false)
    select(`g#linear-rater-item-${item.id}`).classed('selected', false)
    const song = items.find(it => it.id === item.id)  
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
    <LinearRaterContext.Provider value={{ getScoreCategoryDetails, yToScore, raterHeight , onDragStart, onDragEnd, onCircleHover }}>

    <div ref={containerRef} style={{ width: "100%", height: "100%", position: 'relative' }}>
      {hovered && <SongTooltip song={hovered.song} position={hovered.position}  /> }
        {height > 0 && <svg ref={svgRef} width={width} height={height}>
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
            
            <rect x={config.x} y={config.y} width={config.width} height={raterHeight} fill="url(#rater-gradient)"  /> 
              {groups.map((group, i) => 
                 isSingle(group)? <LinearRaterItem key={`liner-item-group-${i}`} item={group} largestGroupItemCount={largestGroupItemCount}  /> : 
                 isMultiple(group) ? <LinearRaterGroupItem key={`linear-item-group-${i}`} item={group} largestGroupItemCount={largestGroupItemCount}/> : null  
              )}
            {/* unrated items  */}
            <rect x={config.x} y={raterHeight} width={config.width} height={unratedConfig.height} fill={UNRATED_COLOR}  /> 
            {unratedGroup.items.length && <UnratedLinearRaterItem item={unratedGroup} y ={raterHeight+unratedConfig.offset} />}
      </svg>
        }
    </div>
    </LinearRaterContext.Provider>
  );
};
