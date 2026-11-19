/* Resumo do dashboard; erro de rede mantém os valores anteriores e sinaliza a falha; resposta incompleta vira zero */
/* Cada pedido leva um número (meta.requestId): resposta de pedido antigo é ignorada (#25) */
const INITIAL_STATE = { summary: { credit: 0, debt: 0 }, error: false, loading: false, requestId: 0 }

/* Resposta de um pedido que não é o último: não mexe no estado */
const isStale = (state, action) =>
    Boolean(action.meta && action.meta.requestId) && action.meta.requestId !== state.requestId

/* Reducer do dashboard */
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'BILLING_SUMMARY_REQUESTED': {
            const requestId = (action.meta && action.meta.requestId) || state.requestId
            return { ...state, loading: true, error: false, requestId }
        }
        case 'BILLING_SUMMARY_FETCHED': {
            if (isStale(state, action)) return state
            if (action.error) return { ...state, error: true, loading: false }
            const data = (action.payload && action.payload.data) || {}
            return { ...state, summary: { credit: Number(data.credit) || 0, debt: Number(data.debt) || 0 }, error: false, loading: false }
        }
        default:
            return state
    }
}
/* Fim de DashboardReducer.js */
