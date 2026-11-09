/* Resumo do dashboard; erro de rede mantém os valores anteriores e sinaliza a falha; resposta incompleta vira zero */
const INITIAL_STATE = { summary: { credit: 0, debt: 0 }, error: false, loading: false }

/* Reducer do dashboard */
export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'BILLING_SUMMARY_REQUESTED':
            return { ...state, loading: true, error: false }
        case 'BILLING_SUMMARY_FETCHED':
            if (action.error) return { ...state, error: true, loading: false }
            const data = (action.payload && action.payload.data) || {}
            return { ...state, summary: { credit: Number(data.credit) || 0, debt: Number(data.debt) || 0 }, error: false, loading: false }
        default:
            return state
    }
}
/* Fim de DashboardReducer.js */
