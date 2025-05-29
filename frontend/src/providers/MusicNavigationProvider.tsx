import { createContext } from "react"
import { RaterEntityRequest } from "../models/RaterModels"
import { FilterMode } from "../music/MusicFilters"

export const MusicNavigatorContext = createContext<MusicNavigationContext>({ openOverview: undefined, dispatchToRater: () => {} })  

export interface MusicNavigationContext {
    openOverview: any
    dispatchToRater: (entity:RaterEntityRequest, mode:FilterMode) => void
} 