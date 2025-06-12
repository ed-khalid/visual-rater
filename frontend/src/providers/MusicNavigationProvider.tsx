import { createContext } from "react"
import { RaterEntityRequest } from "../models/RaterModels"
import { OverviewLink } from "../models/OverviewModels"
import { FilterMode } from "../music/MusicFilters"

export const MusicNavigatorContext = createContext<MusicNavigationContext>({ openOverview: () => {}, dispatchToRater: () => {} })  

export interface MusicNavigationContext {
    openOverview: (link:OverviewLink) => void
    dispatchToRater: (entity:RaterEntityRequest, mode:FilterMode) => void
} 