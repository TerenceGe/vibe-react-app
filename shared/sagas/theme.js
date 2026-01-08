import { takeEvery } from 'redux-saga/effects'
import * as actions from 'actions/theme'

function setTheme(action) {
  const theme = action.payload
  localStorage.setItem('theme', theme)
}

export default function* themeSaga() {
  yield takeEvery(String(actions.setTheme), setTheme)
}
