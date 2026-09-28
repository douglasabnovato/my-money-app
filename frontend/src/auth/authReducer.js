/* Estado de autenticação persistido no localStorage (com leitura tolerante a falhas) */
const userKey = '_mymoney_user'

/* Lê o usuário salvo sem quebrar em navegação privada ou JSON inválido */
function readUser() {
    try {
        return JSON.parse(localStorage.getItem(userKey))
    } catch {
        return null
    }
}

const INITIAL_STATE = { user: readUser(), validToken: false }

/* Reducer de autenticação */
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'TOKEN_VALIDATED':
            if (action.payload) {
                return { ...state, validToken: true }
            }
            try { localStorage.removeItem(userKey) } catch { /* sem armazenamento */ }
            return { ...state, validToken: false, user: null }
        case 'USER_FETCHED':
            try { localStorage.setItem(userKey, JSON.stringify(action.payload)) } catch { /* sem armazenamento */ }
            return { ...state, user: action.payload, validToken: true }
        default:
            return state
    }
}
/* Fim de authReducer.js */
