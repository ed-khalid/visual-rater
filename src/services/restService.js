import request from 'superagent'
import { ACTIONS } from '../actions'

const dataService = store => next => action => {

    next(action)
    switch(action.type) {
        case ACTIONS.UPDATE_RATER_SCORE:
          request
            .get('http://localhost:4000/artists/' + 'Radiohead')
            .end((err,res) => {
                if (err) console.log(err.text)
                console.log(res.text)
            })
            break
        default:
          break 
    }
   

}

export default dataService
