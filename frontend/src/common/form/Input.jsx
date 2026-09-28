/* Campo simples usado nas linhas de crédito/débito (rótulo acessível via aria-label) */
import React from "react"

export default props => (
    <input {...props.input}
        className="form-control"
        placeholder={props.placeholder}
        aria-label={props.label || props.placeholder}
        readOnly={props.readOnly}
        type={props.type}
        inputMode={props.inputMode}
    />
)
/* Fim de Input.jsx */
