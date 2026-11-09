import axios from 'axios'
import consts from '../consts'
const BASE_URL = consts.API_URL

/* Marca o carregamento antes do pedido (redux-multi) e entrega a resposta depois (redux-promise) */
export function getSummary() {
    const request = axios.get(`${BASE_URL}/billingCycles/summary`)
    return [
        { type: 'BILLING_SUMMARY_REQUESTED' },
        { type: 'BILLING_SUMMARY_FETCHED', payload: request }
    ]
}