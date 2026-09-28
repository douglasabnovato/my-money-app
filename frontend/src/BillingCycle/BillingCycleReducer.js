/* Lista de ciclos; em erro mantém a lista e marca a falha */
const INITIAL_STATE = { list: [], error: false }

/* Reducer dos ciclos de pagamento */
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'BILLING_CYCLES_FETCHED':
            if (action.error) return { ...state, error: true }
            return { ...state, list: action.payload.data, error: false }
        default:
            return state
    }
}
/* Fim de BillingCycleReducer.js */
