import { takeEvery } from 'redux-saga/effects'
import * as actions from 'actions/intl'

function setLocale(action) {
  const locale = action.payload
  localStorage.setItem('locale', locale)
}

export default function* intlSaga() {
  yield takeEvery(String(actions.setLocale), setLocale)
}
