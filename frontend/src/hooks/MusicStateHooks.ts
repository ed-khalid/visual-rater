import { useContext } from "react"
import { MusicDispatchContext, MusicStateContext } from "../providers/MusicReducerProvider"
import { MusicStateOperator } from "../music/MusicStateOperator"


export const useMusicState = () => {
    const context = useContext(MusicStateContext) 
    if (!context) {
        throw 'music state was undefined!'
    }
    return  context 
}
export const useMusicDispatch = () => {
    const context = useContext(MusicDispatchContext) 
    if (!context) {
        throw 'music dispatch was undefined!'
    }
    return  context 
}
export const useMusicStateAndDispatch = () => {
    const state = useMusicState()
    const dispatch = useMusicDispatch()
    return { state, dispatch }
} 
export const useMusicStateOperator =  () => {
    const state = useMusicState()
    return new MusicStateOperator(state)
}