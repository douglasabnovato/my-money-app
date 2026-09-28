/* Mostra os erros da API em toasts, inclusive quando não há resposta (rede fora) */
import { toastr } from 'react-redux-toastr'

/* Extrai mensagens do erro do axios e exibe cada uma */
export function showErrors(error) {
    const errors = error && error.response && error.response.data && error.response.data.errors
    const list = Array.isArray(errors) && errors.length ? errors
        : [error && error.response ? 'Não foi possível concluir a operação.' : 'Sem conexão com o servidor. Tente novamente.']
    list.forEach(message => toastr.error('Erro', message))
}
/* Fim de errors.js */
