import { AnimatePresence, motion } from "motion/react"
import './SongTooltip.css'
import { Song } from "../../../generated/graphql"

interface Props {
    song:Song
    position: { x:number, y:number }
}

export const SongTooltip = ({song, position}: Props) => {

    const dominantColors = song.album.thumbnailDominantColors  
    var background = "white"
    if (dominantColors) {
      background = `linear-gradient(to bottom, rgb(${dominantColors[0]}) 0%, rgb(${dominantColors[1]}) 75%, rgb(${dominantColors[2]}) 100%)`  
    }


    const offset = 12

    return (
        <AnimatePresence>
            <motion.div 
               className="linear-rater-tooltip"
               key={`song-tooltip-${song.id}`}
               initial={{opacity: 0 , y: 10}}
               animate={{opacity: 1 , y: 0}}
               exit={{opacity:0, y: 10}}
               transition={{ duration: 0.2 }}
               style={{
                top: position.y + offset,  
                left: position.x + offset,
                background
               }}
            >
                 <div className="thumbnail">
                    <img src={song.album.thumbnail || ''} />
                 </div>
                 <div style={{background: 'white'}} className="title">
                    {song.name}
                 </div>
                 <div style={{background: 'white'}} className="number">
                    #{song.number}
                 </div>
                 <div style={{background: 'white'}}className="on italic">
                      on
                 </div>
                 <div style={{background: 'white'}}className="by italic">
                      by
                 </div>
                 <div style={{background: 'white'}}className="score-label italic">
                      score
                 </div>
                 <div style={{background: 'white'}}className="empty">
                 </div>
                 <div style={{background: 'white'}}className="artist-name">
                    {song.artist.name}
                 </div>
                 <div style={{background: 'white'}}className="album-name">
                    {song.album.name}
                 </div>
                 <div style={{background: 'white'}}className="score">
                    {song.score}
                 </div>
            </motion.div>

        </AnimatePresence>

    )

}