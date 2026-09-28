/* Endereços da API lidos do ambiente do Vite (VITE_API_BASE) */
const BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3003').replace(/\/$/, '')

export default {
    API_URL: `${BASE}/api`,
    OAPI_URL: `${BASE}/oapi`,
}
/* Fim de consts.js */
