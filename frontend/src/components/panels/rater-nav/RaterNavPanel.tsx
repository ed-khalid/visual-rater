import { Panel } from "../../common/Panel"

interface Props {
    rows:number[]
    scrollToRow: (rowIndex:number) => void
    orientation : 'top'|'bottom'
} 

export const RaterNavPanel = ({rows, scrollToRow, orientation}:Props) => {
    if (rows.length === 0) return <></>
    return <Panel className={"rater-nav-panel " + (orientation) }>
        <div>
            {rows.map((i) =>
            <button key={`button-${i}`}
              onClick={() => scrollToRow(i)}
            >{i+1}</button>
             )}
        </div>
    </Panel>

}