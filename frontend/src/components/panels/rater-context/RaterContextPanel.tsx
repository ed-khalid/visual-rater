import { useMusicStateAndDispatch, useMusicStateOperator } from "../../../hooks/MusicStateHooks"
import { Panel } from "../../common/Panel"
import './RaterContextPanel.css'
import '../../common/Panel.css'

interface Props {
    isCollpased:boolean

}


export const RaterContextPanel = ({isCollpased}:Props) => {

    const { state, dispatch } = useMusicStateAndDispatch() 
    const operator = useMusicStateOperator()  
    const  contextArtists = operator.getContextArtists()   

    return <Panel id="rater-context-panel" isCollapsible={true} collapseDirection="up">
        <div>
            <div className="context-title">Context</div>
            <div className="context-wrapper">
            {contextArtists.map(it => 
                <div className="context-artist">
                    <div className="context-artist-name">
                    {it.artist.name}
                    </div>
                    <div className="context-artist-thumbnail">
                        <img src={it.artist.thumbnail || ''} />
                    </div>
                </div>
            )}
            </div>
        </div>
    </Panel> 
    
}