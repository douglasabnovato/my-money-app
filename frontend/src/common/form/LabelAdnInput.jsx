/* Campo com rótulo associado (id = nome do campo) e mensagem de erro do redux-form */
import React from "react"
import Grid from "../layout/Grid"

export default props => {
    const { input, meta = {}, label, cols, placeholder, readOnly, type, children } = props
    const id = `field-${input.name}`
    const error = meta.touched && meta.error
    return (
        <Grid cols={cols}>
            <div className={`form-group ${error ? "has-error" : ""}`}>
                <label htmlFor={id}>{label}</label>
                {children ? (
                    <select {...input} id={id} className="form-control" disabled={readOnly} aria-invalid={!!error}>{children}</select>
                ) : (
                    <input {...input} id={id} className="form-control" placeholder={placeholder} readOnly={readOnly} type={type} aria-invalid={!!error} />
                )}
                {error && <span className="help-block">{error}</span>}
            </div>
        </Grid>
    )
}
/* Fim de LabelAdnInput.jsx */
