import React, { Fragment, useEffect, useState } from 'react'
import classNames from 'classnames'
import 'resources/fonts/style.css'
import { Outlet, useLocation } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import Title from 'components/DocumentTitle'
import { Buffer } from 'safe-buffer'
import darkThemeStyle from 'resources/themes/dark'
import lightThemeStyle from 'resources/themes/light'
import styles from './style.css'

const Root = ({ location, history, theme, actions }) => {
  const [title, setTitle] = useState('Vive React App')

  useEffect(() => {
    setTitle('Vive React App')
  }, [])

  return (
    <Fragment>
      <Title render={title} />
      <div className={classNames(styles.root)}>
        <div className={classNames(styles.content)}>
          <Outlet />
        </div>
      </div>
    </Fragment>
  )
}

export default withRouter(
  connect(
    state => ({
      theme: state.theme.mode
    }),
    dispatch => ({
      actions: bindActionCreators({

      }, dispatch)
    })
  )(Root)
)
