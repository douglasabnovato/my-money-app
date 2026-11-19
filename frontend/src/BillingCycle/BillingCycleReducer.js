/* Lista de ciclos; em erro mantém a lista e marca a falha */
/* Cada pedido leva um número (meta.requestId): resposta de pedido antigo é ignorada (#25) */
const INITIAL_STATE = { list: [], error: false, loading: false, requestId: 0 }

/* Resposta de um pedido que não é o último: não mexe no estado */
const isStale = (state, action) =>
    Boolean(action.meta && action.meta.requestId) && action.meta.requestId !== state.requestId

/* Reducer dos ciclos de pagamento */
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'BILLING_CYCLES_REQUESTED': {
            const requestId = (action.meta && action.meta.requestId) || state.requestId
            return { ...state, loading: true, error: false, requestId }
        }
        case 'BILLING_CYCLES_FETCHED':
            if (isStale(state, action)) return state
            if (action.error) return { ...state, error: true, loading: false }
            return { ...state, list: Array.isArray(action.payload.data) ? action.payload.data : [], error: false, loading: false }
        default:
            return state
    }
}
/* Fim de BillingCycleReducer.js */
