import 'core-js/stable'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReduxRouter } from '@lagunovsky/redux-react-router'
import { createBrowserHistory } from 'history'
import * as bundles from 'routes/async'
import Provider from 'components/Provider'
import { errorLoading } from 'utils'
import configure from 'store'
import Routes from 'routes'
import sagas from 'sagas'

const isPreloaded = !!window.__PRELOADED_STATE__
const preloadedState = window.__PRELOADED_STATE__ || {}
const preloadedChunks = window.__PRELOADED_CHUNKS__ || []
const browserHistory = createBrowserHistory()
const store = configure(preloadedState, browserHistory)
store.runSaga(sagas)

// 禁用浏览器的自动滚动恢复功能
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

// 监听 Redux store 变化，自动滚动到页面顶部
if (typeof window !== 'undefined') {
  let lastPathname = null
  
  store.subscribe(() => {
    const state = store.getState()
    const currentPathname = state.router?.location?.pathname
    
    if (currentPathname && currentPathname !== lastPathname) {
      // 使用 requestAnimationFrame + setTimeout 确保在 DOM 渲染完成后再滚动
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo(0, 0)
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        }, 0)
      })
      
      lastPathname = currentPathname
    }
  })
}

const renderApp = (Routes) => {
  if (isPreloaded) {
    ReactDOM.hydrateRoot(
      document.getElementById('root'),
      <Provider store={store}>
        <ReduxRouter history={browserHistory}>
          <Routes />
        </ReduxRouter>
      </Provider>
    )
  } else {
    const root = ReactDOM.createRoot(document.getElementById('root'))

    root.render(
      <Provider store={store}>
        <ReduxRouter history={browserHistory}>
          <Routes />
        </ReduxRouter>
      </Provider>
    )
  }
}

async function runApp() {
  try {
    if (!window.Intl) {
      await import('intl'/* webpackChunkName: 'intl' */)
      await Promise.all([
        import('intl/locale-data/jsonp/en.js'/* webpackChunkName: 'en' */),
        import('intl/locale-data/jsonp/zh.js'/* webpackChunkName: 'zh' */)
      ])
      console.log('using intl polyfill')
    }

    if (preloadedChunks) {
      await Promise.all(preloadedChunks.map(
        chunk => bundles[chunk].loadComponent()
      ))
    }

    renderApp(Routes)
  } catch (error) {
    errorLoading(error)
  }
}

if (module.hot) {
  module.hot.accept('routes', () => {
    const nextRoutes = require('routes').default
    renderApp(nextRoutes)
  })
}

runApp()
