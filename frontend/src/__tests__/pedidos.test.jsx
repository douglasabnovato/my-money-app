/* Pedidos simultâneos (#25): a resposta de um pedido antigo não desliga o carregamento nem troca os dados */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { applyMiddleware, createStore } from 'redux'
import promiseModule from 'redux-promise'
import multiModule from 'redux-multi'
import thunkModule from 'redux-thunk'

vi.mock('axios', () => ({ default: { get: vi.fn() } }))

import axios from 'axios'
import reducers from '../main/reducers'
import { getList } from '../BillingCycle/BillingCycleActions'
import { getSummary } from '../Dashboard/DashboardActions'

const asMiddleware = mod => (typeof mod === 'function' ? mod : mod.default)
const [promise, multi, thunk] = [promiseModule, multiModule, thunkModule].map(asMiddleware)

/* Promessa que o teste resolve na ordem que quiser */
function adiado() {
  let resolve
  let reject
  const p = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { p, resolve, reject }
}

function criarStore() {
  return createStore(reducers, applyMiddleware(multi, thunk, promise))
}

/* Despacha e trata a rejeição que o redux-promise devolve, para não sobrar erro solto no teste */
function despachar(store, acao) {
  const r = store.dispatch(acao)
  ;(Array.isArray(r) ? r : [r]).forEach(x => x && typeof x.catch === 'function' && x.catch(() => {}))
}

beforeEach(() => vi.clearAllMocks())

describe('pedidos simultâneos (#25)', () => {
  it('lista: a resposta antiga chega por último e é ignorada; o carregamento só sai com a mais nova', async () => {
    const antigo = adiado()
    const novo = adiado()
    axios.get.mockReturnValueOnce(antigo.p).mockReturnValueOnce(novo.p)
    const store = criarStore()

    despachar(store, getList())
    despachar(store, getList())
    expect(store.getState().billingCycle.loading).toBe(true)

    novo.resolve({ data: [{ _id: '2', name: 'Dezembro' }] })
    await waitFor(() => expect(store.getState().billingCycle.loading).toBe(false))
    expect(store.getState().billingCycle.list).toEqual([{ _id: '2', name: 'Dezembro' }])

    antigo.resolve({ data: [{ _id: '1', name: 'Novembro' }] })
    await antigo.p
    await new Promise(r => setTimeout(r, 0))
    expect(store.getState().billingCycle.list).toEqual([{ _id: '2', name: 'Dezembro' }])
    expect(store.getState().billingCycle.loading).toBe(false)
  })

  it('lista: a resposta antiga chega primeiro e não desliga o carregamento', async () => {
    const antigo = adiado()
    const novo = adiado()
    axios.get.mockReturnValueOnce(antigo.p).mockReturnValueOnce(novo.p)
    const store = criarStore()

    despachar(store, getList())
    despachar(store, getList())

    antigo.resolve({ data: [{ _id: '1', name: 'Novembro' }] })
    await antigo.p
    await new Promise(r => setTimeout(r, 0))
    expect(store.getState().billingCycle.loading).toBe(true)
    expect(store.getState().billingCycle.list).toEqual([])

    novo.resolve({ data: [{ _id: '2', name: 'Dezembro' }] })
    await waitFor(() => expect(store.getState().billingCycle.loading).toBe(false))
    expect(store.getState().billingCycle.list).toEqual([{ _id: '2', name: 'Dezembro' }])
  })

  it('painel: erro de um pedido antigo não marca falha nem troca o resumo', async () => {
    const antigo = adiado()
    const novo = adiado()
    axios.get.mockReturnValueOnce(antigo.p).mockReturnValueOnce(novo.p)
    const store = criarStore()

    despachar(store, getSummary())
    despachar(store, getSummary())

    novo.resolve({ data: { credit: 4000, debt: 1500.5 } })
    await waitFor(() => expect(store.getState().dashboard.loading).toBe(false))

    antigo.reject(new Error('rede'))
    await antigo.p.catch(() => {})
    await new Promise(r => setTimeout(r, 0))
    expect(store.getState().dashboard.error).toBe(false)
    expect(store.getState().dashboard.summary).toEqual({ credit: 4000, debt: 1500.5 })
  })
})
/* Fim de pedidos.test.jsx */
