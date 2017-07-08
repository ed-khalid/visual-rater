export const ACTIONS = { TRACK_LOCATION: 'TRACK_LOCATION'}  
export function TrackLocationActionCreator(event)  {
    return {
        type: ACTIONS.TRACK_LOCATION
        ,d3Event: event
    }
}  

