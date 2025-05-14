import { useReducer } from "react"
import { MusicState } from "../music/MusicState"
import { musicReducer } from "../reducers/musicReducer"
import App from "../App"
import React from "react"
import { MusicAction } from "../music/MusicAction"



export const ReducerProvider = () => {
  const [musicState, musicDispatch] = useReducer<React.Reducer<MusicState,MusicAction>>(musicReducer, 
    
    { data: 
      { artists: [], 
        albums:[], 
        songs:[] 
      } , 
      navigationFilters: [],
      raterFilters: { hideAll: true, artistIds: [], albumIds: [], songIds: [], scoreFilter: { start: 0 , end: 100}  } })
  return <App musicState={musicState} musicDispatch={musicDispatch} /> 
} 
