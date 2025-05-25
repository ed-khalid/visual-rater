

import { createContext } from "react"

export const MusicNavigatorContext = createContext<MusicNavigationContext>({ openOverview: undefined, dispatchToRater: undefined })  

export interface MusicNavigationContext {
    openOverview: any
    dispatchToRater: any
} 