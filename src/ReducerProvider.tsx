import { useReducer } from "react"
import { MusicState } from "./models/domain/MusicState"
import { MusicAction, musicReducer } from "./reducers/musicReducer"
import App from "./App"
import React from "react"



export const ReducerProvider = () => {
  const [musicState, musicDispatch] = useReducer<React.Reducer<MusicState,MusicAction>>(musicReducer, { data: { artists: [], albums:[], songs:[] } , filters: { artistIds: [] , albumIds:[], songIds: [], scoreFilter:{start:0, end:5} }  })
  return <App musicState={musicState} musicDispatch={musicDispatch} /> 
} 
