/* Campo do login/cadastro com rótulo visível apenas para leitores de tela */
import React from 'react'
import If from '../operator/If'

export default props => (
    <If test={!props.hide}>
        <div className="form-group has-feedback">
            <label className="sr-only" htmlFor={`auth-${props.input.name}`}>{props.placeholder}</label>
            <input {...props.input}
                id={`auth-${props.input.name}`}
                className='form-control'
                placeholder={props.placeholder}
                autoComplete={props.autoComplete}
                readOnly={props.readOnly}
                type={props.type} />
            <span className={`glyphicon glyphicon-${props.icon} form-control-feedback`} aria-hidden="true"></span>
        </div>
    </If>
)
/* Fim de InputAuth.jsx */
