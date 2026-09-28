/* Formatação monetária em reais (pt-BR) */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/* Converte número em "R$ 1.234,56" */
export function formatBRL(value) {
    return brl.format(Number(value) || 0)
}
/* Fim de format.js */
