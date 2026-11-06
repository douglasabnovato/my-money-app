/* Testes do front: formatação, reducers tolerantes a erro e rótulos acessíveis */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { consolidar, formatBRL, formatPercent } from '../common/format'
import { fraseTaxa } from '../Dashboard/Dashboard'
import dashboardReducer from '../Dashboard/DashboardReducer'
import billingReducer from '../BillingCycle/BillingCycleReducer'
import LabelAdnInput from '../common/form/LabelAdnInput'

describe('format', () => {
  it('formata reais em pt-BR', () => {
    expect(formatBRL(3499.5)).toMatch(/R\$\s3\.499,50/)
    expect(formatBRL('abc')).toMatch(/R\$\s0,00/)
  })
})

describe('reducers', () => {
  it('erro de rede no resumo mantém valores e sinaliza falha', () => {
    const state = dashboardReducer(undefined, { type: 'BILLING_SUMMARY_FETCHED', error: true, payload: new Error('x') })
    expect(state).toEqual({ summary: { credit: 0, debt: 0 }, error: true })
  })
  it('lista de ciclos carregada limpa o erro', () => {
    const state = billingReducer({ list: [], error: true }, { type: 'BILLING_CYCLES_FETCHED', payload: { data: [{ _id: '1' }] } })
    expect(state).toEqual({ list: [{ _id: '1' }], error: false })
  })
})

describe('consolidado', () => {
  it('calcula saldo e taxa de poupança', () => {
    expect(consolidar({ credit: 4000, debt: 3000 })).toEqual({ credit: 4000, debt: 3000, saldo: 1000, taxa: 0.25 })
    expect(formatPercent(0.25)).toMatch(/25\s?%/)
  })
  it('sem créditos ou com resumo vazio, a taxa fica nula', () => {
    expect(consolidar(undefined)).toEqual({ credit: 0, debt: 0, saldo: 0, taxa: null })
    expect(fraseTaxa(consolidar({}))).toBe('Cadastre créditos para ver quanto sobra.')
  })
  it('avisa quando os débitos passam dos créditos', () => {
    expect(fraseTaxa(consolidar({ credit: 1000, debt: 1500 }))).toMatch(/passam dos créditos em R\$\s500,00/)
    expect(fraseTaxa(consolidar({ credit: 1000, debt: 250 }))).toMatch(/Sobraram 75\s?% dos créditos/)
  })
  it('resposta sem dados no resumo não quebra o painel', () => {
    const state = dashboardReducer(undefined, { type: 'BILLING_SUMMARY_FETCHED', payload: {} })
    expect(state).toEqual({ summary: { credit: 0, debt: 0 }, error: false })
  })
})

describe('LabelAdnInput', () => {
  it('associa o rótulo ao campo e mostra o erro', () => {
    render(<LabelAdnInput input={{ name: 'year', value: '', onChange() {} }} meta={{ touched: true, error: 'Informe o ano' }} label="Ano" type="number" />)
    const field = screen.getByLabelText('Ano')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText('Informe o ano')).toBeTruthy()
  })
})
/* Fim de app.test.jsx */
