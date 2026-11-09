/* Lista de ciclos; em erro mantém a lista e marca a falha */
const INITIAL_STATE = { list: [], error: false, loading: false }

/* Reducer dos ciclos de pagamento */
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'BILLING_CYCLES_REQUESTED':
            return { ...state, loading: true }
        case 'BILLING_CYCLES_FETCHED':
            if (action.error) return { ...state, error: true, loading: false }
            return { ...state, list: Array.isArray(action.payload.data) ? action.payload.data : [], error: false, loading: false }
        default:
            return state
    }
}
/* Fim de BillingCycleReducer.js */
