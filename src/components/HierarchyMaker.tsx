import React from "react"
import { useState } from "react"

interface Props {

}

interface Hierarchy {
    name:string
    levels:HierarchyLevel[]
}
interface HierarchyLevel {
    name:string
}

export const HierarchyMaker = ({}:Props) => {

    const [hierarchy, setHierarchy] = useState<Hierarchy|undefined>() 

    const onHierarchyNameChange = (newVal:string) => {
        setHierarchy(prev => ({...prev!, name:newVal}))
    }
    const onLevelNameChange = (level:HierarchyLevel, index:number, newVal:string) => {
        setHierarchy(prev => {
            const levels = [...prev!.levels] 
            levels[index] = { name: newVal } 
            return { ...prev!, levels }
        })
    }

    const onCreate = () => {

    } 

    return <div id="hiearchy-maker">
        {!hierarchy && <button onClick={() => setHierarchy({ name: '', levels: [{name: ''}]}) }>New Hierarchy</button>}
        {hierarchy && 
        <React.Fragment>
            <label htmlFor="hierachy-name">Hierarchy Name</label>
            <input onChange={(e) => onHierarchyNameChange(e.target.value)  } name="hierarchy-name" />  
        {hierarchy.levels.map((level,i) => <div className="hierarchy-level">
            <label htmlFor="level-name">Level Name</label>
            <input onChange={(e) => onLevelNameChange(level,i, e.target.value) } name="level-name" />  
        </div>)}
        <button onClick={() => setHierarchy(hierarchy => ({ ...hierarchy!, levels:[...hierarchy!.levels, { name: '' }]  }) ) }>Add Level</button>
        <button onClick={() => onCreate()}>Create</button>
        </React.Fragment>}
        </div>


}