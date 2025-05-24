

import { createContext } from "react"

export const MusicNavigatorContext = createContext<MusicNavigationContext>({ openArtistOverview: undefined, dispatchToRater: undefined })  

export interface MusicNavigationContext {
    openArtistOverview: any
    dispatchToRater: any
} 