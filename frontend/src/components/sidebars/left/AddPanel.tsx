
import { Panel } from "../../panels/Panel"
import { SpotifyIconSvg } from "../../svg/SpotifyIconSvg" 
import { PlusIconSvg } from "../../svg/PlusIconSvg" 
import { useEffect, useState } from "react"
import './AddPanel.css'

interface Props {
    onSpotifySearch: any
    reset: boolean
}

export const AddPanel = ({onSpotifySearch, reset}: Props) => {




   const [showInputField, setShowInputField] = useState<boolean>(false)
   const [inputValue, setInputValue] = useState<string>('')

   useEffect(() => {
    if (reset) {
        setInputValue('')
    }
   }, [reset])


   const onChange = (val:string) => {
      setInputValue(val)
   }  
    const onPlusClick = () => {
        console.log('plus clicked')
    }
    const onSpotifyClick = () => {
        setShowInputField(!showInputField)
    }


    return <Panel id="add-panel">

     <div>
    <div id="add-panel-buttons" className="flex">
        <div  className="add-panel-option">
            <PlusIconSvg onClick={onPlusClick} />
        </div>
        <div className="add-panel-option">
            <SpotifyIconSvg onClick={onSpotifyClick} />
    </div>
    {showInputField && 
      <input value={inputValue} onChange={(e) => onChange(e.target.value)} type="text" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onSpotifySearch(inputValue)
                    }
                    return
                } 
                }></input>}
    </div>
     </div>

    </Panel>




}