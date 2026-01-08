import { asyncComponent } from 'components/DynamicComponent'

export const Home = asyncComponent(() => import('pages/Home'/* webpackChunkName: 'Home' */))
