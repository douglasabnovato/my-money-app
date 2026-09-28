/* Ações de autenticação: login, cadastro, sair e validação do token salvo */
import axios from 'axios'
import consts from '../consts'
import { showErrors } from '../common/msg/errors'

/* Envia credenciais para a rota de login */
export function login(values) {
    return submit(values, `${consts.OAPI_URL}/login`)
}

/* Envia dados de cadastro */
export function signup(values) {
    return submit(values, `${consts.OAPI_URL}/signup`)
}

/* Posta o formulário e guarda o usuário autenticado */
function submit(values, url) {
    return dispatch => {
        axios.post(url, values)
            .then(resp => dispatch([{ type: 'USER_FETCHED', payload: resp.data }]))
            .catch(showErrors)
    }
}

/* Encerra a sessão */
export function logout() {
    return { type: 'TOKEN_VALIDATED', payload: false }
}

/* Confere no servidor se o token salvo ainda vale */
export function validateToken(token) {
    return dispatch => {
        if (token) {
            axios.post(`${consts.OAPI_URL}/validateToken`, { token })
                .then(resp => dispatch({ type: 'TOKEN_VALIDATED', payload: resp.data.valid }))
                .catch(() => dispatch({ type: 'TOKEN_VALIDATED', payload: false }))
        } else {
            dispatch({ type: 'TOKEN_VALIDATED', payload: false })
        }
    }
}
/* Fim de authActions.js */
