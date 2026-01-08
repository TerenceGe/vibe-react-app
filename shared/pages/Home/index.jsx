import React, { Fragment, useEffect, useState, useCallback } from 'react'
import classNames from 'classnames'
import { Outlet } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'utils/withRouter'
import Title from 'components/DocumentTitle'
import styles from './style.css'

const Home = ({ location, history, theme, actions }) => {
  return (
    <div className={styles.home}>
      hello world
    </div>
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
  )(Home)
)
