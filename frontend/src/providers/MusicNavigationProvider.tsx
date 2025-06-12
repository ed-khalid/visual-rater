import { createContext } from "react"
import { RaterEntityRequest } from "../models/RaterModels"
import { FilterMode } from "../music/MusicFilterModels"
import { OverviewLink } from "../models/OverviewModels"

export const MusicNavigatorContext = createContext<MusicNavigationContext>({ openOverview: () => {}, dispatchToRater: () => {} })  

export interface MusicNavigationContext {
    openOverview: (link:OverviewLink) => void
    dispatchToRater: (entity:RaterEntityRequest, mode:FilterMode) => void
} 