/* Testes do front: formatação, reducers tolerantes a erro e rótulos acessíveis */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { formatBRL } from '../common/format'
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

describe('LabelAdnInput', () => {
  it('associa o rótulo ao campo e mostra o erro', () => {
    render(<LabelAdnInput input={{ name: 'year', value: '', onChange() {} }} meta={{ touched: true, error: 'Informe o ano' }} label="Ano" type="number" />)
    const field = screen.getByLabelText('Ano')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText('Informe o ano')).toBeTruthy()
  })
})
/* Fim de app.test.jsx */
