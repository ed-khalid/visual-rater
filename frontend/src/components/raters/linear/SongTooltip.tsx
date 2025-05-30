import { AnimatePresence, motion } from "motion/react"
import { FatSong } from "../../../models/CoreModels"
import './SongTooltip.css'

interface Props {
    fatSong:FatSong
    position: { x:number, y:number }
}

export const SongTooltip = ({fatSong, position}: Props) => {
     const { song, album, artist } = fatSong

    const offset = 12

    return (
        <AnimatePresence>
            <motion.div 
               className="linear-rater-tooltip"
               key={`song-tooltip-${fatSong.song.id}`}
               initial={{opacity: 0 , y: 10}}
               animate={{opacity: 1 , y: 0}}
               exit={{opacity:0, y: 10}}
               transition={{ duration: 0.2 }}
               style={{
                top: position.y + offset,  
                left: position.x + offset,
               }}
            >
                 <div className="thumbnail">
                    <img src={album.thumbnail || ''} />
                 </div>
                 <div className="title">
                    {song.name}
                 </div>
                 <div className="number">
                    #{song.number}
                 </div>
                 <div className="on italic">
                      on
                 </div>
                 <div className="by italic">
                      by
                 </div>
                 <div className="score-label italic">
                      score
                 </div>
                 <div className="empty">
                 </div>
                 <div className="artist-name">
                    {artist.name}
                 </div>
                 <div className="album-name">
                    {album.name}
                 </div>
                 <div className="score">
                    {song.score}
                 </div>
            </motion.div>

        </AnimatePresence>

    )

}