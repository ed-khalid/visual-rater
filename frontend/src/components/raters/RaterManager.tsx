import './RaterManager.css'
import { GridRater } from "./grid/GridRater"
import { Song, useUpdateSongMutation } from "../../generated/graphql"
import { RaterStyle } from "../../models/RaterModels"
import { PlaylistRater } from "./playlist/PlaylistRater"
import { useMusicState } from "../../hooks/MusicStateHooks"

// type RaterProps = {
//     rowRefs: RefObject<HTMLDivElement>[] 
// } 

interface Props {
    raterStyle:RaterStyle
    totalRows: number
}

export const RaterManager = ({raterStyle, totalRows}:Props) => {

    const musicState = useMusicState() 

    // const { data, loading, error } = useGetSongsPageQuery({ variables: { input:  filters}})  

    const [updateSong]  = useUpdateSongMutation();

    // const wrapperRef = useRef<HTMLDivElement|null>(null)
    // const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set()) 

    // const rowRefs = useRef<RefObject<HTMLDivElement>[]>(
    //     Array.from({length: totalRows}, () => createRef<HTMLDivElement>())
    // ) 

    // useEffect(() => {
    //     if (!wrapperRef.current) {
    //         return
    //     }
    //     const observer = new IntersectionObserver(
    //         (entries) => {
    //             const newVisibleRows = new Set<number>()
    //             entries.forEach((entry) => {
    //                 const row = parseInt(entry.target.getAttribute('data-row') || '-1', 10) 
    //                 if (entry.isIntersecting) newVisibleRows.add(row)
    //             })
    //         setVisibleRows(newVisibleRows)
    //         },
    //         {
    //             root: wrapperRef.current,
    //             threshold: 0.5
    //         }
    //     )
    //     rowRefs.current.forEach((ref) => {
    //         if (ref.current) observer.observe(ref.current)
    //     })
    // return () => {
    //     observer.disconnect()
    // }

    // }, [])

    // const scrollToRow = (rowIndex:number) => {
    //     const el = rowRefs.current[rowIndex]?.current 
    //     if (el) {
    //         el.scrollIntoView({ behavior: 'smooth', block: 'start'})
    //     }
    // }
    // const min = visibleRows.size ? Math.min(...visibleRows) : 0 
    // const max = visibleRows.size ? Math.max(...visibleRows) : totalRows - 1
    // console.log('visibleRows', visibleRows)

  const onScoreUpdate = (updatedSong:Song) => {
    updateSong({ variables: { song: { id: updatedSong.id, score: updatedSong.score  } }})
  } 




    return <div id="rater-wrapper">
            <div id="rater-content">
                {(raterStyle=== RaterStyle.GRID) ?  <GridRater onScoreUpdate={onScoreUpdate}  /> :
                (raterStyle=== RaterStyle.PLAYLIST) ? <PlaylistRater onScoreUpdate={onScoreUpdate} /> :
                <></>}
            </div>
        </div> 
    
} 