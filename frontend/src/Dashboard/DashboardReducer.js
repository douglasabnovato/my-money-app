/* Resumo do dashboard; erro de rede mantém os valores anteriores e sinaliza a falha */
const INITIAL_STATE = { summary: { credit: 0, debt: 0 }, error: false }

/* Reducer do dashboard */
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'BILLING_SUMMARY_FETCHED':
            if (action.error) return { ...state, error: true }
            return { ...state, summary: action.payload.data, error: false }
        default:
            return state
    }
}
/* Fim de DashboardReducer.js */
