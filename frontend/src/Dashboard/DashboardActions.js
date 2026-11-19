import axios from 'axios'
import consts from '../consts'
const BASE_URL = consts.API_URL

let lastRequestId = 0

/* Marca o carregamento antes do pedido (redux-multi) e entrega a resposta depois (redux-promise) */
/* O número do pedido vai no meta; o redux-promise o mantém na ação da resposta (#25) */
export function getSummary() {
    const meta = { requestId: ++lastRequestId }
    const request = axios.get(`${BASE_URL}/billingCycles/summary`)
    return [
        { type: 'BILLING_SUMMARY_REQUESTED', meta },
        { type: 'BILLING_SUMMARY_FETCHED', payload: request, meta }
    ]
}