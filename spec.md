# Redux + Saga 通用开发规范

> 本文档为 LLM 辅助开发设计，提供 Redux + Saga 架构的通用规范、模板和最佳实践。适用于任何使用此技术栈的项目。

---

## 目录

1. [架构概述](#1-架构概述)
2. [目录结构规范](#2-目录结构规范)
3. [Actions 规范](#3-actions-规范)
4. [Reducers 规范](#4-reducers-规范)
5. [Sagas 规范](#5-sagas-规范)
6. [API 层规范](#6-api-层规范)
7. [组件连接规范](#7-组件连接规范)
8. [Store 配置](#8-store-配置)
9. [代码模板](#9-代码模板)
10. [新模块开发清单](#10-新模块开发清单)
11. [常见错误与解决方案](#11-常见错误与解决方案)
12. [工具函数封装](#12-工具函数封装)
13. [高级 API 层设计](#13-高级-api-层设计)
14. [Provider 组件模式](#14-provider-组件模式)
15. [路由集成最佳实践](#15-路由集成最佳实践)
16. [动态组件加载](#16-动态组件加载)

---

## 1. 架构概述

### 1.1 核心概念

| 概念 | 职责 | 特点 |
|------|------|------|
| **Action** | 描述发生了什么 | 纯对象，包含 `type` 和 `payload` |
| **Reducer** | 同步更新 State | 纯函数，接收 state 和 action，返回新 state |
| **Saga** | 处理副作用 | Generator 函数，处理异步逻辑、API 调用 |
| **Store** | 存储应用状态 | 单一数据源，状态不可变 |
| **Selector** | 从 State 提取数据 | 可组合、可缓存 |

### 1.2 数据流

```
┌──────────────────────────────────────────────────────────────┐
│                        用户界面 (UI)                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ 用户交互触发
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     dispatch(action)                          │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│        Reducer          │     │           Saga              │
│    (同步状态更新)         │     │      (异步副作用处理)         │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              │                               │ call API
              │                               ▼
              │                 ┌─────────────────────────────┐
              │                 │          API Layer          │
              │                 └─────────────────────────────┘
              │                               │
              │                               │ put(action)
              │                               ▼
              │                 ┌─────────────────────────────┐
              │                 │   dispatch 更新 action       │
              └────────────────►│      (触发 Reducer)          │
                                └─────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         Store                                 │
│                    (状态树更新)                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ connect / useSelector
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    组件重新渲染                                │
└──────────────────────────────────────────────────────────────┘
```

### 1.3 职责分离原则

| 层级 | 应该做 | 不应该做 |
|------|--------|----------|
| **Component** | 渲染 UI、dispatch action、本地 UI 状态 | API 调用、复杂业务逻辑 |
| **Action** | 定义事件类型和载荷 | 包含业务逻辑 |
| **Reducer** | 同步更新 state | API 调用、异步操作、副作用 |
| **Saga** | 异步操作、API 调用、复杂流程控制 | 直接修改 state |
| **API Layer** | HTTP 请求、响应处理 | 业务逻辑、状态管理 |

---

## 2. 目录结构规范

### 2.1 推荐目录结构

```
src/
├── store/                    # Redux Store 配置
│   └── index.js
├── actions/                  # Action Creators
│   ├── index.js             # 统一导出
│   ├── user.js
│   ├── product.js
│   └── order.js
├── reducers/                 # Reducers
│   ├── index.js             # Root Reducer
│   ├── user.js
│   ├── product.js
│   └── order.js
├── sagas/                    # Sagas
│   ├── index.js             # Root Saga
│   ├── user.js
│   ├── product.js
│   └── order.js
├── api/                      # API 层
│   ├── index.js             # API 工具函数
│   ├── user.js
│   ├── product.js
│   └── order.js
├── selectors/                # Selectors（可选）
│   ├── user.js
│   └── product.js
├── utils/                    # 工具函数
│   └── redux-helpers.js
├── components/               # UI 组件
└── pages/                    # 页面组件
```

### 2.2 命名规范

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| Action 文件 | 小写，单数 | `user.js`, `product.js` |
| Action Type | 领域/SCREAMING_SNAKE | `user/FETCH_PROFILE` |
| Action Creator | camelCase | `fetchProfile`, `updateUser` |
| Reducer 文件 | 小写，单数 | `user.js`, `product.js` |
| Saga 文件 | 小写，单数 | `user.js`, `product.js` |
| Saga 函数 | camelCase + Saga 后缀 | `fetchProfileSaga`, `userSaga` |

---

## 3. Actions 规范

### 3.1 创建 Action

使用 `redux-actions` 的 `createAction`：

```javascript
import { createAction } from 'redux-actions'

// 格式：领域/动词_名词
export const fetchUser = createAction('user/FETCH')
export const fetchUserSuccess = createAction('user/FETCH_SUCCESS')
export const fetchUserFailure = createAction('user/FETCH_FAILURE')
export const updateUser = createAction('user/UPDATE')
export const resetUser = createAction('user/RESET')
```

或使用纯对象（不依赖库）：

```javascript
// Action Types
export const USER_FETCH = 'user/FETCH'
export const USER_FETCH_SUCCESS = 'user/FETCH_SUCCESS'
export const USER_FETCH_FAILURE = 'user/FETCH_FAILURE'

// Action Creators
export const fetchUser = (userId) => ({
  type: USER_FETCH,
  payload: { userId }
})

export const fetchUserSuccess = (data) => ({
  type: USER_FETCH_SUCCESS,
  payload: data
})

export const fetchUserFailure = (error) => ({
  type: USER_FETCH_FAILURE,
  payload: error,
  error: true
})
```

### 3.2 Action 命名约定

| 前缀/模式 | 用途 | 触发者 |
|-----------|------|--------|
| `fetch*` / `get*` / `load*` | 请求数据 | Saga 监听 |
| `fetch*Success` | 请求成功 | Saga 内部 put |
| `fetch*Failure` | 请求失败 | Saga 内部 put |
| `update*` / `set*` | 同步更新 State | Reducer 处理 |
| `reset*` / `clear*` | 重置 State | Reducer 处理 |
| `submit*` / `create*` / `delete*` | 写操作 | Saga 监听 |

### 3.3 带回调的 Action Payload

用于组件需要知道异步操作结果时：

```javascript
// 组件中调用
dispatch(submitForm({
  data: formData,
  onSuccess: (result) => {
    toast.success('提交成功')
    navigate('/success')
  },
  onError: (error) => {
    toast.error(error.message)
  }
}))

// Saga 中处理
function* submitFormSaga(action) {
  const { data, onSuccess, onError } = action.payload

  try {
    const result = yield call(api.submitForm, data)
    onSuccess?.(result)
  } catch (error) {
    onError?.(error)
  }
}
```

---

## 4. Reducers 规范

### 4.1 基本结构

**使用 Immer（推荐）：**

```javascript
import { produce } from 'immer'

const initialState = {
  data: null,
  loading: false,
  error: null
}

const userReducer = (state = initialState, action) => {
  return produce(state, draft => {
    switch (action.type) {
      case 'user/FETCH':
        draft.loading = true
        draft.error = null
        break

      case 'user/FETCH_SUCCESS':
        draft.loading = false
        draft.data = action.payload
        break

      case 'user/FETCH_FAILURE':
        draft.loading = false
        draft.error = action.payload
        break

      case 'user/RESET':
        return initialState
    }
  })
}

export default userReducer
```

**使用 redux-actions + Immer：**

```javascript
import { handleActions } from 'redux-actions'
import { produce } from 'immer'
import * as actions from '../actions/user'

const initialState = {
  data: null,
  loading: false,
  error: null
}

// 自定义 handleActions 包装器（使用 Immer）
const handleActionsWithImmer = (handlers, defaultState) => {
  const wrappedHandlers = {}
  for (const [key, handler] of Object.entries(handlers)) {
    wrappedHandlers[key] = produce(handler)
  }
  return handleActions(wrappedHandlers, defaultState)
}

export default handleActionsWithImmer({
  [actions.fetchUser]: (state) => {
    state.loading = true
    state.error = null
  },

  [actions.fetchUserSuccess]: (state, action) => {
    state.loading = false
    state.data = action.payload
  },

  [actions.fetchUserFailure]: (state, action) => {
    state.loading = false
    state.error = action.payload
  },

  [actions.resetUser]: () => initialState
}, initialState)
```

### 4.2 Root Reducer

```javascript
import { combineReducers } from 'redux'
import user from './user'
import product from './product'
import order from './order'

const rootReducer = combineReducers({
  user,
  product,
  order
})

export default rootReducer
```

### 4.3 Reducer 设计原则

1. **保持纯函数**：相同输入必须产生相同输出
2. **不要修改原 state**：使用 Immer 或展开运算符
3. **初始化所有字段**：避免 undefined
4. **处理 loading/error 状态**：标准化异步状态管理

```javascript
// 推荐的 State 形状
const initialState = {
  // 数据
  data: null,           // 或 [], {}
  byId: {},             // 规范化数据
  allIds: [],           // ID 列表

  // 状态
  loading: false,
  error: null,

  // 分页（如需要）
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  },

  // 筛选（如需要）
  filters: {}
}
```

---

## 5. Sagas 规范

### 5.1 核心 Effects

```javascript
import {
  // 监听 Actions
  takeEvery,      // 监听每个 action
  takeLatest,     // 只处理最新的 action（取消之前的）
  takeLeading,    // 忽略后续 action，直到当前完成

  // 调用函数
  call,           // 调用函数或 Promise
  apply,          // 调用对象方法 apply(obj, obj.method, [args])

  // 派发 Action
  put,            // 同步 dispatch
  putResolve,     // 等待 dispatch 完成

  // 获取 State
  select,         // 从 store 获取 state

  // 流程控制
  all,            // 并行执行多个 effects
  race,           // 竞争执行，返回最先完成的
  fork,           // 非阻塞调用，创建子任务
  spawn,          // 创建独立子任务（不受父任务影响）
  join,           // 等待 fork 的任务完成
  cancel,         // 取消 fork 的任务
  cancelled,      // 检查是否被取消

  // 时间控制
  delay,          // 延迟执行
  debounce,       // 防抖
  throttle,       // 节流
} from 'redux-saga/effects'
```

### 5.2 Saga 结构模板

```javascript
import { takeEvery, takeLatest, call, put, select, delay } from 'redux-saga/effects'
import * as actions from '../actions/user'
import * as api from '../api/user'

/**
 * 获取用户信息
 */
function* fetchUserSaga(action) {
  try {
    const { userId } = action.payload

    // 调用 API
    const response = yield call(api.getUser, userId)

    // 更新 state
    yield put(actions.fetchUserSuccess(response.data))
  } catch (error) {
    yield put(actions.fetchUserFailure(error.message))
  }
}

/**
 * 更新用户信息
 */
function* updateUserSaga(action) {
  const { data, onSuccess, onError } = action.payload

  try {
    // 获取当前 state
    const currentUser = yield select(state => state.user.data)

    // 调用 API
    const response = yield call(api.updateUser, {
      ...currentUser,
      ...data
    })

    // 更新 state
    yield put(actions.fetchUserSuccess(response.data))

    // 回调通知
    onSuccess?.(response.data)
  } catch (error) {
    onError?.(error.message)
  }
}

/**
 * 搜索用户（防抖）
 */
function* searchUserSaga(action) {
  const { keyword } = action.payload

  // 防抖延迟
  yield delay(300)

  try {
    const response = yield call(api.searchUsers, keyword)
    yield put(actions.searchUserSuccess(response.data))
  } catch (error) {
    yield put(actions.searchUserFailure(error.message))
  }
}

/**
 * Root Saga
 */
export default function* userSaga() {
  yield takeEvery(actions.fetchUser.toString(), fetchUserSaga)
  yield takeEvery(actions.updateUser.toString(), updateUserSaga)
  yield takeLatest(actions.searchUser.toString(), searchUserSaga)  // 使用 takeLatest 实现取消
}
```

### 5.3 Root Saga

```javascript
import { all, fork } from 'redux-saga/effects'
import userSaga from './user'
import productSaga from './product'
import orderSaga from './order'

export default function* rootSaga() {
  yield all([
    fork(userSaga),
    fork(productSaga),
    fork(orderSaga)
  ])
}
```

### 5.4 常用 Saga 模式

#### 模式 1：基础 API 调用

```javascript
function* fetchDataSaga(action) {
  try {
    yield put(actions.setLoading(true))
    const response = yield call(api.getData, action.payload)
    yield put(actions.setData(response.data))
  } catch (error) {
    yield put(actions.setError(error.message))
  } finally {
    yield put(actions.setLoading(false))
  }
}
```

#### 模式 2：带认证的 API 调用

```javascript
function* fetchProtectedDataSaga(action) {
  try {
    // 从 state 或 storage 获取 token
    const token = yield select(state => state.auth.token)
    // 或: const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('未登录')
    }

    const response = yield call(api.getProtectedData, action.payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    yield put(actions.setData(response.data))
  } catch (error) {
    if (error.status === 401) {
      yield put(actions.logout())
    }
    yield put(actions.setError(error.message))
  }
}
```

#### 模式 3：重试逻辑

```javascript
function* fetchWithRetrySaga(action) {
  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = yield call(api.getData, action.payload)
      yield put(actions.setData(response.data))
      return // 成功则退出
    } catch (error) {
      retries++
      if (retries >= maxRetries) {
        yield put(actions.setError('请求失败，请稍后重试'))
        return
      }
      // 指数退避
      yield delay(1000 * Math.pow(2, retries - 1))
    }
  }
}
```

#### 模式 4：轮询

```javascript
function* pollDataSaga(action) {
  while (true) {
    try {
      const response = yield call(api.getData)
      yield put(actions.setData(response.data))
    } catch (error) {
      console.error('轮询失败:', error)
    }
    yield delay(5000) // 每 5 秒轮询一次
  }
}

// 启动/停止轮询
function* watchPollSaga() {
  while (true) {
    yield take(actions.startPolling)
    const pollTask = yield fork(pollDataSaga)

    yield take(actions.stopPolling)
    yield cancel(pollTask)
  }
}
```

#### 模式 5：并行请求

```javascript
function* fetchMultipleDataSaga(action) {
  try {
    // 并行请求
    const [users, products, orders] = yield all([
      call(api.getUsers),
      call(api.getProducts),
      call(api.getOrders)
    ])

    yield put(actions.setUsers(users.data))
    yield put(actions.setProducts(products.data))
    yield put(actions.setOrders(orders.data))
  } catch (error) {
    yield put(actions.setError(error.message))
  }
}
```

#### 模式 6：竞态处理

```javascript
function* fetchWithTimeoutSaga(action) {
  const { response, timeout } = yield race({
    response: call(api.getData, action.payload),
    timeout: delay(10000)
  })

  if (timeout) {
    yield put(actions.setError('请求超时'))
  } else {
    yield put(actions.setData(response.data))
  }
}
```

#### 模式 7：状态变化通知

```javascript
function* longOperationSaga(action) {
  const { data, onStatusChange, onSuccess, onError } = action.payload

  try {
    onStatusChange?.('preparing')
    yield call(api.prepare, data)

    onStatusChange?.('processing')
    const result = yield call(api.process, data)

    onStatusChange?.('finalizing')
    yield call(api.finalize, result.id)

    onStatusChange?.('completed')
    onSuccess?.(result)
  } catch (error) {
    onStatusChange?.('failed')
    onError?.(error.message)
  }
}
```

#### 模式 8：调用对象方法（apply）

```javascript
function* callObjectMethodSaga() {
  const sdk = new SomeSDK()

  // 使用 apply 调用对象方法
  yield apply(sdk, sdk.init)
  const result = yield apply(sdk, sdk.doSomething, [param1, param2])

  yield put(actions.setResult(result))
}
```

---

## 6. API 层规范

### 6.1 API 工具函数

```javascript
// api/index.js

/**
 * 创建 API 请求函数的工厂
 */
export const createApi = (baseURL, defaultOptions = {}) => {
  return async (method, endpoint, data = {}, options = {}) => {
    const url = `${baseURL}${endpoint}`
    const mergedOptions = { ...defaultOptions, ...options }

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...mergedOptions.headers
      }
    }

    // 认证处理
    if (mergedOptions.requireAuth) {
      const token = mergedOptions.getToken?.() || localStorage.getItem('token')
      if (token) {
        fetchOptions.headers.Authorization = `Bearer ${token}`
      }
    }

    // 请求体处理
    if (method === 'GET' || method === 'DELETE') {
      const params = new URLSearchParams(data).toString()
      if (params) url += `?${params}`
    } else {
      fetchOptions.body = JSON.stringify(data)
    }

    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw { status: response.status, message: error.message || 'Request failed' }
    }

    return response.json()
  }
}

// 创建实例
export const api = createApi('/api/v1')
export const authApi = createApi('/api/v1', { requireAuth: true })
```

### 6.2 API 模块定义

```javascript
// api/user.js
import { api, authApi } from './index'

export const getUser = (userId) =>
  api('GET', `/users/${userId}`)

export const getUsers = (params) =>
  api('GET', '/users', params)

export const createUser = (data) =>
  authApi('POST', '/users', data)

export const updateUser = (userId, data) =>
  authApi('PUT', `/users/${userId}`, data)

export const deleteUser = (userId) =>
  authApi('DELETE', `/users/${userId}`)
```

---

## 7. 组件连接规范

### 7.1 Class 组件（connect HOC）

```javascript
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as userActions from '../actions/user'

class UserProfile extends Component {
  componentDidMount() {
    const { userId, actions } = this.props
    actions.fetchUser({ userId })
  }

  handleUpdate = (data) => {
    const { actions } = this.props

    actions.updateUser({
      data,
      onSuccess: () => {
        alert('更新成功')
      },
      onError: (error) => {
        alert(`更新失败: ${error}`)
      }
    })
  }

  render() {
    const { user, loading, error } = this.props

    if (loading) return <div>加载中...</div>
    if (error) return <div>错误: {error}</div>
    if (!user) return null

    return (
      <div>
        <h1>{user.name}</h1>
        <button onClick={() => this.handleUpdate({ name: 'New Name' })}>
          更新
        </button>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.user.data,
  loading: state.user.loading,
  error: state.user.error
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(userActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile)
```

### 7.2 函数组件（Hooks）

```javascript
import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as userActions from '../actions/user'

const UserProfile = ({ userId }) => {
  const dispatch = useDispatch()

  // 从 state 获取数据
  const user = useSelector(state => state.user.data)
  const loading = useSelector(state => state.user.loading)
  const error = useSelector(state => state.user.error)

  // 初始化加载
  useEffect(() => {
    dispatch(userActions.fetchUser({ userId }))
  }, [dispatch, userId])

  // 事件处理
  const handleUpdate = useCallback((data) => {
    dispatch(userActions.updateUser({
      data,
      onSuccess: () => {
        alert('更新成功')
      },
      onError: (error) => {
        alert(`更新失败: ${error}`)
      }
    }))
  }, [dispatch])

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error}</div>
  if (!user) return null

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        更新
      </button>
    </div>
  )
}

export default UserProfile
```

### 7.3 自定义 Hook（推荐）

```javascript
// hooks/useUser.js
import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as userActions from '../actions/user'

export const useUser = (userId) => {
  const dispatch = useDispatch()

  const user = useSelector(state => state.user.data)
  const loading = useSelector(state => state.user.loading)
  const error = useSelector(state => state.user.error)

  const fetchUser = useCallback(() => {
    dispatch(userActions.fetchUser({ userId }))
  }, [dispatch, userId])

  const updateUser = useCallback((data, callbacks = {}) => {
    dispatch(userActions.updateUser({ data, ...callbacks }))
  }, [dispatch])

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId, fetchUser])

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser
  }
}

// 使用
const UserProfile = ({ userId }) => {
  const { user, loading, error, updateUser } = useUser(userId)

  // ...
}
```

---

## 8. Store 配置

### 8.1 基础配置

```javascript
// store/index.js
import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer from '../reducers'
import rootSaga from '../sagas'

const sagaMiddleware = createSagaMiddleware()

const composeEnhancers =
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
  || compose

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
)

sagaMiddleware.run(rootSaga)

export default store
```

### 8.2 带路由的配置

```javascript
// store/index.js
import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { createRouterMiddleware } from '@lagunovsky/redux-react-router'
import createRootReducer from '../reducers'
import rootSaga from '../sagas'

export default function configureStore(history, preloadedState = {}) {
  const sagaMiddleware = createSagaMiddleware()
  const routerMiddleware = createRouterMiddleware(history)

  const middlewares = [routerMiddleware, sagaMiddleware]

  const composeEnhancers =
    (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
    || compose

  const store = createStore(
    createRootReducer(history),
    preloadedState,
    composeEnhancers(applyMiddleware(...middlewares))
  )

  // 挂载 saga runner（用于动态加载 saga）
  store.runSaga = sagaMiddleware.run
  store.runSaga(rootSaga)

  // 热更新支持
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(createRootReducer(history))
    })
  }

  return store
}
```

### 8.3 入口文件配置

```javascript
// index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserHistory } from 'history'
import { ReduxRouter } from '@lagunovsky/redux-react-router'
import configureStore from './store'
import App from './App'

const history = createBrowserHistory()
const store = configureStore(history)

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <Provider store={store}>
    <ReduxRouter history={history}>
      <App />
    </ReduxRouter>
  </Provider>
)
```

---

## 9. 代码模板

### 9.1 完整模块模板

以下是一个完整的 "User" 模块实现：

#### actions/user.js
```javascript
import { createAction } from 'redux-actions'

// 获取用户
export const fetchUser = createAction('user/FETCH')
export const fetchUserSuccess = createAction('user/FETCH_SUCCESS')
export const fetchUserFailure = createAction('user/FETCH_FAILURE')

// 更新用户
export const updateUser = createAction('user/UPDATE')

// 重置
export const resetUser = createAction('user/RESET')
```

#### reducers/user.js
```javascript
import { handleActions } from 'redux-actions'
import { produce } from 'immer'
import * as actions from '../actions/user'

const initialState = {
  data: null,
  loading: false,
  error: null
}

const handlers = {
  [actions.fetchUser]: (state) => {
    state.loading = true
    state.error = null
  },

  [actions.fetchUserSuccess]: (state, action) => {
    state.loading = false
    state.data = action.payload
  },

  [actions.fetchUserFailure]: (state, action) => {
    state.loading = false
    state.error = action.payload
  },

  [actions.resetUser]: () => initialState
}

// 使用 Immer 包装
const wrappedHandlers = Object.fromEntries(
  Object.entries(handlers).map(([key, handler]) => [key, produce(handler)])
)

export default handleActions(wrappedHandlers, initialState)
```

#### sagas/user.js
```javascript
import { takeEvery, call, put } from 'redux-saga/effects'
import * as actions from '../actions/user'
import * as api from '../api/user'

function* fetchUserSaga(action) {
  try {
    const { userId } = action.payload
    const response = yield call(api.getUser, userId)
    yield put(actions.fetchUserSuccess(response.data))
  } catch (error) {
    yield put(actions.fetchUserFailure(error.message))
  }
}

function* updateUserSaga(action) {
  const { data, onSuccess, onError } = action.payload

  try {
    const response = yield call(api.updateUser, data)
    yield put(actions.fetchUserSuccess(response.data))
    onSuccess?.(response.data)
  } catch (error) {
    onError?.(error.message)
  }
}

export default function* userSaga() {
  yield takeEvery(actions.fetchUser.toString(), fetchUserSaga)
  yield takeEvery(actions.updateUser.toString(), updateUserSaga)
}
```

#### api/user.js
```javascript
import { api, authApi } from './index'

export const getUser = (userId) =>
  api('GET', `/users/${userId}`)

export const updateUser = (data) =>
  authApi('PUT', `/users/${data.id}`, data)
```

---

## 10. 新模块开发清单

添加新功能模块时，按以下步骤进行：

### ✅ 完整清单

```
□ 1. 创建 Action 文件
     - 位置: actions/{moduleName}.js
     - 定义所有 action creators
     - 遵循命名规范

□ 2. 创建 Reducer 文件
     - 位置: reducers/{moduleName}.js
     - 定义 initialState
     - 处理所有相关 actions

□ 3. 注册 Reducer
     - 位置: reducers/index.js
     - 添加到 combineReducers

□ 4. 创建 Saga 文件
     - 位置: sagas/{moduleName}.js
     - 实现所有异步逻辑
     - 导出 root saga 函数

□ 5. 注册 Saga
     - 位置: sagas/index.js
     - fork 到 rootSaga

□ 6. 创建 API 文件（如需要）
     - 位置: api/{moduleName}.js
     - 定义所有 API 调用

□ 7. 创建组件/页面
     - 连接 Redux
     - 调用 actions

□ 8. 添加路由（如需要）
     - 注册新路由
```

---

## 11. 常见错误与解决方案

### 错误 1：Action 未被 Saga 监听

```javascript
// ❌ 错误：直接传入 action creator
yield takeEvery(actions.fetchUser, fetchUserSaga)

// ✅ 正确：转换为字符串
yield takeEvery(actions.fetchUser.toString(), fetchUserSaga)
// 或
yield takeEvery(String(actions.fetchUser), fetchUserSaga)
// 或（推荐）使用 action type 常量
yield takeEvery('user/FETCH', fetchUserSaga)
```

### 错误 2：Reducer 直接修改 State

```javascript
// ❌ 错误：直接修改（不使用 Immer）
case 'user/UPDATE':
  state.data = action.payload  // 直接修改！
  return state

// ✅ 正确：返回新对象
case 'user/UPDATE':
  return { ...state, data: action.payload }

// ✅ 正确：使用 Immer
case 'user/UPDATE':
  return produce(state, draft => {
    draft.data = action.payload
  })
```

### 错误 3：Saga 中忘记 yield

```javascript
// ❌ 错误：忘记 yield
function* fetchDataSaga() {
  const response = call(api.getData)  // 缺少 yield！
  put(actions.setData(response))      // 缺少 yield！
}

// ✅ 正确
function* fetchDataSaga() {
  const response = yield call(api.getData)
  yield put(actions.setData(response))
}
```

### 错误 4：select 返回整个 state

```javascript
// ❌ 不推荐：获取整个 state
const state = yield select()
const user = state.user.data

// ✅ 推荐：只获取需要的部分
const user = yield select(state => state.user.data)
```

### 错误 5：组件中直接调用 API

```javascript
// ❌ 错误：在组件中直接调用 API
const handleSubmit = async () => {
  const response = await api.submitData(data)
  dispatch(actions.setData(response))
}

// ✅ 正确：通过 dispatch action 触发 saga
const handleSubmit = () => {
  dispatch(actions.submitData({
    data,
    onSuccess: (result) => { /* ... */ },
    onError: (error) => { /* ... */ }
  }))
}
```

### 错误 6：异步操作放在 Reducer 中

```javascript
// ❌ 错误：Reducer 中不能有副作用
[actions.fetchUser]: (state, action) => {
  api.getUser(action.payload)  // 错误！
    .then(data => state.data = data)
}

// ✅ 正确：异步操作放在 Saga 中
function* fetchUserSaga(action) {
  const response = yield call(api.getUser, action.payload)
  yield put(actions.fetchUserSuccess(response))
}
```

---

## 12. 工具函数封装

### 12.1 handleActions + Immer 自动封装（推荐）

将 `redux-actions` 的 `handleActions` 与 `Immer` 结合，自动为所有 handler 添加不可变更新支持：

```javascript
// utils/redux-actions.js
import { produce } from 'immer'
import { handleActions as reduxHandleActions } from 'redux-actions'

/**
 * 增强版 handleActions
 * 自动使用 Immer 包装所有 handler，支持直接修改 state
 */
export const handleActions = (actions, initialState) => reduxHandleActions(
  Object.keys(actions).reduce((handlers, key) => {
    handlers[key] = produce(actions[key])
    return handlers
  }, {}),
  initialState
)
```

**使用示例：**

```javascript
// reducers/user.js
import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/user'

const initialState = {
  data: null,
  loading: false,
  error: null
}

// 可以直接修改 state，Immer 会自动处理不可变更新
export default handleActions({
  [actions.fetchUser](state, action) {
    state.loading = true
    state.error = null
  },

  [actions.fetchUserSuccess](state, action) {
    state.loading = false
    state.data = action.payload
  },

  [actions.fetchUserFailure](state, action) {
    state.loading = false
    state.error = action.payload
  },

  [actions.resetUser]() {
    return initialState  // 重置时返回初始状态
  }
}, initialState)
```

### 12.2 常用工具函数

```javascript
// utils/index.js

/**
 * 错误加载处理
 */
export const errorLoading = (err) => console.error('Dynamic page loading failed: ', err)

/**
 * 防抖函数
 */
export function debounce(func, wait) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 格式化日期
 * @param {string} dateString - ISO 8601 日期字符串
 * @returns {string} 格式化后的日期，如 "Nov 23, 2025"
 */
export function formatDate(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return dateString
  }
}
```

---

## 13. 高级 API 层设计

### 13.1 API 工厂函数（完整版）

支持多种 Content-Type、认证、响应转换等高级功能：

```javascript
// api/index.js

/**
 * API 工厂函数
 * @param {string} baseUrl - API 基础 URL
 * @param {object} baseOptions - 默认配置
 */
export const apiCreator = (baseUrl, baseOptions = {}) => {
  return async (method = 'GET', endPoint = '/', params = {}, moreOptions = {}) => {
    const options = { ...baseOptions, ...moreOptions }
    const apiKey = options.apiKey
    const requireAuth = options.requireAuth
    const headers = { ...options.headers } || {}
    const tokenFetcher = options.tokenFetcher
    const errorTransformer = options.errorTransformer || (error => Promise.reject({ message: error }))
    const responseTransformer = options.responseTransformer || (res => res)
    let fetchParams = params

    let url = baseUrl + endPoint

    // 默认 headers
    if (!headers.Accept) headers.Accept = 'application/json'
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'

    // 认证处理
    if (requireAuth && tokenFetcher) {
      const token = await tokenFetcher()
      if (token) headers.Authorization = `Bearer ${token}`
    }

    // API Key 处理（支持 header 或 params）
    if (apiKey && typeof apiKey === 'object' && apiKey.key && apiKey.value) {
      if (apiKey.position === 'params') {
        fetchParams = { ...params, [apiKey.key]: apiKey.value }
      } else {
        headers[apiKey.key] = apiKey.value
      }
    }

    const fetchOptions = { method, headers }

    // 请求体处理
    if (method === 'GET' || method === 'DELETE') {
      const queryString = Object.keys(fetchParams)
        .map(k => [k, fetchParams[k]].map(encodeURIComponent).join('='))
        .join('&')
      if (queryString) url += `?${queryString}`
    } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      // URL-encoded
      if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        fetchOptions.body = Object.keys(fetchParams)
          .map(k => [k, fetchParams[k]].join('='))
          .join('&')
      }
      // FormData (文件上传)
      else if (headers['Content-Type'] === 'multipart/form-data') {
        delete headers['Content-Type']  // 让浏览器自动设置 boundary
        const formData = new FormData()
        Object.keys(fetchParams).forEach(key => formData.append(key, fetchParams[key]))
        fetchOptions.body = formData
      }
      // JSON (默认)
      else {
        fetchOptions.body = JSON.stringify(fetchParams)
      }
    }

    // 发送请求
    const res = await fetch(url, fetchOptions)

    // 错误处理
    if (!res.ok) {
      return res.json().then(errorTransformer)
    }

    // 响应处理（根据 Content-Type）
    const contentType = res.headers.get('content-type')

    if (/json/.test(contentType)) {
      return res.json().then(responseTransformer)
    } else if (/event-stream/.test(contentType)) {
      return res.body  // SSE 流
    } else if (/text|javascript|css/.test(contentType)) {
      return res.text().then(responseTransformer)
    }

    return null
  }
}
```

### 13.2 创建多个 API 实例

```javascript
// api/index.js

// Supabase REST API
export const supabaseRestApi = apiCreator(`${SUPABASE_URL}/rest/v1`, {
  headers: {
    apikey: SUPABASE_ANON_KEY
  },
  tokenFetcher: () => SUPABASE_ANON_KEY
})

// Supabase Edge Functions
export const supabaseApi = apiCreator(`${SUPABASE_URL}/functions/v1`, {
  headers: {
    apikey: SUPABASE_ANON_KEY
  },
  tokenFetcher: () => SUPABASE_ANON_KEY
})

// 自定义后端 API
export const backendApi = apiCreator('/api/v1', {
  requireAuth: true,
  tokenFetcher: () => localStorage.getItem('token'),
  responseTransformer: res => res.data,
  errorTransformer: res => Promise.reject({ message: res.message || 'Unknown error' })
})
```

### 13.3 API 模块定义示例

```javascript
// api/market.js
import { backendApi, supabaseRestApi } from './index'

// 获取市场列表
export const getMarkets = (params) =>
  backendApi('GET', '/markets', params)

// 获取市场详情
export const getMarket = (marketId) =>
  backendApi('GET', `/markets/${marketId}`)

// 创建市场
export const createMarket = (data) =>
  backendApi('POST', '/markets', data)

// 使用 Supabase 直接查询
export const getMarketsFromSupabase = (params) =>
  supabaseRestApi('GET', '/markets', {
    select: '*',
    order: 'created_at.desc',
    ...params
  })
```

---

## 14. Provider 组件模式

### 14.1 Redux + IntlProvider 整合

将 Redux 和国际化 Provider 整合到一个组件中：

```javascript
// components/Provider/index.jsx
import React from 'react'
import { connect, Provider as ReduxProvider } from 'react-redux'
import { IntlProvider } from 'react-intl'

// 导入语言包
import zh from 'resources/locales/zh'
import en from 'resources/locales/en'
import zhHant from 'resources/locales/zh-Hant'

const messages = {
  zh,
  en,
  'zh-Hant': zhHant
}

// 连接 Redux 的 IntlProvider
const mapStateToProps = state => ({
  locale: state.intl.locale,
  messages: messages[state.intl.locale]
})

const ConnectedIntlProvider = connect(mapStateToProps)(IntlProvider)

// 统一 Provider 组件
const Provider = ({ store, children }) => (
  <ReduxProvider store={store}>
    <ConnectedIntlProvider>
      {children}
    </ConnectedIntlProvider>
  </ReduxProvider>
)

export default Provider
```

### 14.2 语言切换 Action 和 Saga

```javascript
// actions/intl.js
import { createAction } from 'redux-actions'

export const setLocale = createAction('intl/SET_LOCALE')
```

```javascript
// reducers/intl.js
import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/intl'

const getInitialLocale = () => {
  // 优先从 localStorage 读取
  const saved = typeof localStorage !== 'undefined'
    ? localStorage.getItem('locale')
    : null
  return saved || 'en'
}

const initialState = {
  locale: getInitialLocale()
}

export default handleActions({
  [actions.setLocale](state, action) {
    state.locale = action.payload
  }
}, initialState)
```

```javascript
// sagas/intl.js
import { takeEvery } from 'redux-saga/effects'
import * as actions from 'actions/intl'

// 保存语言设置到 localStorage
function* setLocaleSaga(action) {
  const locale = action.payload
  localStorage.setItem('locale', locale)
}

export default function* intlSaga() {
  yield takeEvery(String(actions.setLocale), setLocaleSaga)
}
```

### 14.3 主题切换模式

```javascript
// actions/theme.js
import { createAction } from 'redux-actions'

export const setTheme = createAction('theme/SET_THEME')
```

```javascript
// reducers/theme.js
import { handleActions } from 'utils/redux-actions'
import * as actions from 'actions/theme'

const initialState = {
  mode: 'dark'  // 'dark' | 'light'
}

export default handleActions({
  [actions.setTheme](state, action) {
    state.mode = action.payload
  }
}, initialState)
```

```javascript
// 在 Root 组件中应用主题
import darkTheme from 'resources/themes/dark.json'
import lightTheme from 'resources/themes/light.json'

const getThemeStyle = (mode) => mode === 'dark' ? darkTheme : lightTheme

// 监听主题变化，应用 CSS 变量
useEffect(() => {
  const themeStyle = getThemeStyle(theme)
  Object.keys(themeStyle).forEach(key => {
    document.documentElement.style.setProperty(key, themeStyle[key])
  })
}, [theme])
```

---

## 15. 路由集成最佳实践

### 15.1 Redux Router 配置

```javascript
// reducers/index.js
import { combineReducers } from 'redux'
import { enableMapSet } from 'immer'
import { createRouterReducer } from '@lagunovsky/redux-react-router'
import { reducer as form } from 'redux-form'
import intl from './intl'
import theme from './theme'

enableMapSet()  // 启用 Immer 对 Map/Set 的支持

const createRootReducer = (history) => combineReducers({
  router: createRouterReducer(history),
  form,
  intl,
  theme,
  // 添加其他 reducers...
})

export default createRootReducer
```

### 15.2 React Router v6 的 withRouter HOC

React Router v6 移除了 `withRouter`，但可以自己实现：

```javascript
// utils/withRouter.js
import React from 'react'
import { useNavigate, useLocation, useParams } from 'react-router'

/**
 * 为 Class 组件提供路由 props 的 HOC
 * 兼容 React Router v6
 */
export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const params = useParams()

    return (
      <Component
        {...props}
        history={navigate}      // navigate 函数
        location={location}     // 当前位置
        params={params}         // URL 参数
      />
    )
  }

  Wrapper.displayName = `withRouter(${Component.displayName || Component.name})`
  return Wrapper
}
```

### 15.3 路由配置

```javascript
// routes/index.js
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Root from 'pages/Root'
import NoMatch from 'components/NoMatch'
import { Landing, Market, Profile, Notification } from 'routes/sync'

// 路由配置数组（可用于 SSR）
export const routes = [
  {
    path: '*',
    component: Root,
    children: [
      { index: true, component: Landing },
      { path: 'market', component: Market },
      { path: 'market/:id', component: MarketDetail },
      { path: 'profile', component: Profile },
      { path: 'notification', component: Notification },
      { path: '*', component: NoMatch }
    ]
  }
]

// 路由组件
export const RootRoutes = () => (
  <Routes>
    <Route path="*" element={<Root />}>
      <Route index element={<Landing />} />
      <Route path="market" element={<Market />} />
      <Route path="market/:id" element={<MarketDetail />} />
      <Route path="profile" element={<Profile />} />
      <Route path="notification" element={<Notification />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
)

export default RootRoutes
```

### 15.4 滚动恢复处理

```javascript
// browser/index.jsx
// 禁用浏览器的自动滚动恢复
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

// 监听路由变化，自动滚动到顶部
if (typeof window !== 'undefined') {
  let lastPathname = null

  store.subscribe(() => {
    const state = store.getState()
    const currentPathname = state.router?.location?.pathname

    if (currentPathname && currentPathname !== lastPathname) {
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
```

---

## 16. 动态组件加载

### 16.1 同步组件包装

用于 SSR 或不需要代码分割的场景：

```javascript
// components/DynamicComponent/index.jsx

/**
 * 同步组件包装器
 * @param {string} chunkName - 组件名称（用于调试）
 * @param {object} module - 组件模块
 */
export function syncComponent(chunkName, module) {
  const Component = module.default || module

  function SyncComponent(props) {
    return <Component {...props} />
  }

  // 保留静态方法（用于 SSR 数据预取）
  SyncComponent.getInitialActions = Component.getInitialActions
  SyncComponent.chunkName = chunkName

  return SyncComponent
}
```

### 16.2 异步组件包装（代码分割）

```javascript
// components/DynamicComponent/index.jsx
import React, { Component } from 'react'
import Loading from 'components/Loading'

/**
 * 异步组件包装器（支持代码分割）
 * @param {function} getComponent - 动态 import 函数
 */
export function asyncComponent(getComponent) {
  return class AsyncComponent extends Component {
    static Component = null
    static isAsync = true

    // 加载组件
    static loadComponent() {
      return getComponent()
        .then(module => module.default || module)
        .then((Component) => {
          AsyncComponent.Component = Component
          AsyncComponent.getInitialActions = Component.getInitialActions
          return Component
        })
    }

    mounted = false
    state = { Component: AsyncComponent.Component }

    load() {
      AsyncComponent.loadComponent().then((Component) => {
        if (this.mounted) {
          this.setState({ Component })
        }
      })
    }

    componentWillMount() {
      if (!this.state.Component) {
        this.load()
      }
    }

    componentDidMount() {
      this.mounted = true
    }

    componentWillUnmount() {
      this.mounted = false
    }

    render() {
      const { Component } = this.state
      return Component ? <Component {...this.props} /> : <Loading />
    }
  }
}
```

### 16.3 路由中使用动态组件

```javascript
// routes/sync.js - 同步加载（SSR）
import { syncComponent } from 'components/DynamicComponent'

export const Landing = syncComponent('Landing', require('pages/Landing'))
export const Market = syncComponent('Market', require('pages/Market'))
export const Profile = syncComponent('Profile', require('pages/Profile'))
```

```javascript
// routes/async.js - 异步加载（代码分割）
import { asyncComponent } from 'components/DynamicComponent'

export const Landing = asyncComponent(
  () => import('pages/Landing'/* webpackChunkName: 'Landing' */)
)

export const Market = asyncComponent(
  () => import('pages/Market'/* webpackChunkName: 'Market' */)
)

export const Profile = asyncComponent(
  () => import('pages/Profile'/* webpackChunkName: 'Profile' */)
)
```

### 16.4 入口文件中预加载 Chunks

```javascript
// browser/index.jsx
import * as bundles from 'routes/async'

async function runApp() {
  try {
    // SSR 时预加载已渲染的 chunks
    const preloadedChunks = window.__PRELOADED_CHUNKS__ || []

    if (preloadedChunks.length) {
      await Promise.all(
        preloadedChunks.map(chunk => bundles[chunk].loadComponent())
      )
    }

    renderApp(Routes)
  } catch (error) {
    errorLoading(error)
  }
}

runApp()
```

---

## 📚 相关资源

- [Redux 官方文档](https://redux.js.org/)
- [Redux-Saga 官方文档](https://redux-saga.js.org/)
- [Immer 官方文档](https://immerjs.github.io/immer/)
- [redux-actions 文档](https://redux-actions.js.org/)
- [@lagunovsky/redux-react-router](https://github.com/lagunovsky/redux-react-router)
- [React Router v6 文档](https://reactrouter.com/)

---

*文档版本: 2.0 | 最后更新: 2026-01-04*
