/* Formatação monetária em reais (pt-BR) */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/* Converte número em "R$ 1.234,56" */
export function formatBRL(value) {
    return brl.format(Number(value) || 0)
}
const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 })

/* Converte 0.25 em "25%" */
export function formatPercent(value) {
    return pct.format(Number(value) || 0)
}

/* Saldo e parte dos créditos que sobrou (taxa de poupança). Sem créditos, a taxa é null. */
export function consolidar(summary) {
    const credit = Number(summary && summary.credit) || 0
    const debt = Number(summary && summary.debt) || 0
    const saldo = credit - debt
    return { credit, debt, saldo, taxa: credit > 0 ? saldo / credit : null }
}
/* Fim de format.js */
