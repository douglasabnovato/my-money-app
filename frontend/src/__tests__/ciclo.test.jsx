/* Fluxo de cadastro de ciclo na tela (API simulada) e estados de carregamento, vazio e erro */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import promiseModule from 'redux-promise'
import multiModule from 'redux-multi'
import thunkModule from 'redux-thunk'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [{ _id: '1', name: 'Novembro', month: 11, year: 2026 }] })),
    post: vi.fn(() => Promise.resolve({ data: { _id: '1' } })),
  },
}))

import axios from 'axios'
import reducers from '../main/reducers'
import BillingCycleForm from '../BillingCycle/BillingCycleForm'
import { BillingCycleList } from '../BillingCycle/BillingCycleList'
import { Dashboard } from '../Dashboard/Dashboard'
import { create, init } from '../BillingCycle/BillingCycleActions'
import { getSummary } from '../Dashboard/DashboardActions'
import dashboardReducer from '../Dashboard/DashboardReducer'
import billingReducer from '../BillingCycle/BillingCycleReducer'

const asMiddleware = mod => (typeof mod === 'function' ? mod : mod.default)
const [promise, multi, thunk] = [promiseModule, multiModule, thunkModule].map(asMiddleware)

/* Store igual ao de main.jsx, com um registro das ações despachadas */
function criarStore() {
  const tipos = []
  const registro = () => next => action => {
    if (action && action.type) tipos.push(action.type)
    return next(action)
  }
  const store = createStore(reducers, applyMiddleware(multi, thunk, promise, registro))
  return { store, tipos }
}

beforeEach(() => vi.clearAllMocks())

describe('cadastro de ciclo na tela', () => {
  it('preenche nome, mês, ano, um crédito e um débito, mostra o saldo e envia', async () => {
    const { store, tipos } = criarStore()
    store.dispatch(init())
    await waitFor(() => expect(tipos).toContain('BILLING_CYCLES_FETCHED'))
    expect(axios.get).toHaveBeenCalledTimes(1)
    render(
      <Provider store={store}>
        <BillingCycleForm onSubmit={values => store.dispatch(create(values))} submitLabel="Incluir" submitClass="primary" />
      </Provider>
    )
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Novembro' } })
    fireEvent.change(screen.getByLabelText('Mês'), { target: { value: '11' } })
    fireEvent.change(screen.getByLabelText('Ano'), { target: { value: '2026' } })
    fireEvent.change(screen.getByLabelText('Créditos: nome da linha 1'), { target: { value: 'Salário' } })
    fireEvent.change(screen.getByLabelText('Créditos: valor da linha 1'), { target: { value: '4000' } })
    fireEvent.change(screen.getByLabelText('Débitos: nome da linha 1'), { target: { value: 'Aluguel' } })
    fireEvent.change(screen.getByLabelText('Débitos: valor da linha 1'), { target: { value: '1500,50' } })

    expect(screen.getByText(/R\$\s2\.499,50/)).toBeTruthy()

    tipos.length = 0
    fireEvent.click(screen.getByRole('button', { name: 'Incluir' }))

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
    const [url, corpo] = axios.post.mock.calls[0]
    expect(url).toMatch(/\/api\/billingCycles\/$/)
    expect(corpo).toMatchObject({ name: 'Novembro', month: '11', year: '2026' })
    expect(corpo.credits[0]).toEqual({ name: 'Salário', value: '4000' })
    expect(corpo.debts[0]).toMatchObject({ name: 'Aluguel', value: '1500,50' })
    /* Depois de salvar, a lista é pedida de novo e chega */
    await waitFor(() => expect(tipos).toContain('BILLING_CYCLES_FETCHED'))
    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(store.getState().billingCycle.list).toHaveLength(1)
  })
})

describe('carregamento, vazio e erro', () => {
  it('reducers marcam carregamento e limpam ao chegar resposta ou erro', () => {
    let d = dashboardReducer(undefined, { type: 'BILLING_SUMMARY_REQUESTED' })
    expect(d.loading).toBe(true)
    d = dashboardReducer(d, { type: 'BILLING_SUMMARY_FETCHED', error: true, payload: new Error('x') })
    expect(d).toMatchObject({ loading: false, error: true })
    let b = billingReducer({ list: [], error: true, loading: false }, { type: 'BILLING_CYCLES_REQUESTED' })
    expect(b).toMatchObject({ loading: true, error: false })
    b = billingReducer(b, { type: 'BILLING_CYCLES_FETCHED', payload: { data: null } })
    expect(b).toEqual({ list: [], error: false, loading: false })
  })

  it('as ações pedem carregamento antes da resposta', () => {
    expect(getSummary().map(a => a.type)).toEqual(['BILLING_SUMMARY_REQUESTED', 'BILLING_SUMMARY_FETCHED'])
  })

  it('lista: carregando, vazia e com erro', () => {
    const props = { getList() {}, showUpdate() {}, showDelete() {} }
    const { rerender } = render(<BillingCycleList {...props} list={[]} loading />)
    expect(screen.getByRole('status').textContent).toBe('Carregando ciclos…')
    expect(screen.queryByText(/Nenhum ciclo cadastrado/)).toBeNull()
    rerender(<BillingCycleList {...props} list={[]} />)
    expect(screen.getByText(/Nenhum ciclo cadastrado/)).toBeTruthy()
    rerender(<BillingCycleList {...props} list={[]} error />)
    expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível carregar os ciclos/)
  })

  it('painel: carregando e depois a frase do resumo', () => {
    const { rerender } = render(<Dashboard getSummary={() => {}} summary={{ credit: 0, debt: 0 }} loading />)
    expect(screen.getByRole('status').textContent).toBe('Carregando o resumo…')
    rerender(<Dashboard getSummary={() => {}} summary={{ credit: 1000, debt: 250 }} />)
    expect(screen.getByRole('status').textContent).toMatch(/Sobraram 75\s?% dos créditos/)
  })
})
/* Fim de ciclo.test.jsx */
