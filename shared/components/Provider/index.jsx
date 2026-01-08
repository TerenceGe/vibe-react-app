import React from 'react'
import { connect, Provider as ReduxProvider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import zh from 'resources/locales/zh'
import en from 'resources/locales/en'
import zhHant from 'resources/locales/zh-Hant'

const messages = {
  zh,
  en,
  'zh-Hant': zhHant
}

const mapStateToProps = state => ({
  locale: state.intl.locale,
  messages: messages[state.intl.locale]
})

const ConnectedIntlProvider = connect(mapStateToProps)(IntlProvider)

const Provider = ({ store, children }) => (
  <ReduxProvider store={store}>
    <ConnectedIntlProvider>
      {children}
    </ConnectedIntlProvider>
  </ReduxProvider>
)

export default Provider
