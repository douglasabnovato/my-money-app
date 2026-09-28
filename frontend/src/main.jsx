/* Ponto de entrada do front: store Redux (multi, thunk, promise) e renderização com React 18 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { applyMiddleware, createStore, compose } from 'redux'
import { Provider } from 'react-redux'
import promiseModule from 'redux-promise'
import multiModule from 'redux-multi'
import thunkModule from 'redux-thunk'

import AuthOrApp from './main/AuthOrApp'
import reducers from './main/reducers'

/* Pacotes CommonJS antigos podem chegar como { default: fn } no bundler moderno */
const asMiddleware = mod => (typeof mod === 'function' ? mod : mod.default)
const [promise, multi, thunk] = [promiseModule, multiModule, thunkModule].map(asMiddleware)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(multi, thunk, promise)))

createRoot(document.getElementById('app')).render(
    <Provider store={store}>
        <AuthOrApp />
    </Provider>
)
/* Fim de main.jsx */
