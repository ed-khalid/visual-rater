import { createContext, Dispatch, ReactElement, useReducer } from "react"
import { MusicState } from "../music/MusicState"
import { musicReducer } from "../reducers/musicReducer"
import { MusicAction } from "../music/MusicAction"


interface Props {
  children: ReactElement
}

    
  export const MusicStateContext = createContext<MusicState|undefined>(undefined) 
  export const MusicDispatchContext = createContext<Dispatch<MusicAction>|undefined>(undefined) 

export const MusicReducerProvider = ({children}:Props) => {
  const [musicState, musicDispatch] = useReducer(musicReducer, 
    { 
      songFilters: { artistIds: null, albumIds: null },
      playlistFilters: { pageNumber: 0 },
      gridFilters: { pageNumber: 0 },
    }
  )

  return <MusicStateContext.Provider value={musicState}>
    <MusicDispatchContext.Provider value={musicDispatch}>
      {children}
    </MusicDispatchContext.Provider>
  </MusicStateContext.Provider> 
} 
