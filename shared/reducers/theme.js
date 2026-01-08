import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/theme'

const initialState = {
  mode: 'dark'
}

export default handleActions({
  [actions.setTheme] (state, action) {
    state.mode = action.payload
  }
}, initialState)
