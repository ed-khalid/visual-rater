
import { useEffect, useState } from "react"
import './AddPanel.css'
import { Panel } from "../common/Panel"
import { SpotifySearchResults } from "./SpotifySearchPanel"

interface Props {
    onFinishAlbumSelections?: (artist: any, albums: any[]) => void
}

export const AddPanel = ({onFinishAlbumSelections}: Props) => {
   const [inputValue, setInputValue] = useState<string>('')

   const onChange = (val:string) => {
      setInputValue(val)
   }  


    return <Panel id="add-panel">

     <div>
      <input className="search-input" value={inputValue} onChange={(e) => onChange(e.target.value)} type="text" />
    <SpotifySearchResults term={inputValue} onFinishAlbumSelections={onFinishAlbumSelections} onCancel={() => setInputValue('')} />
     </div>

    </Panel>




}