/* Lista de abas: role="tablist" dá aos botões role="tab" o pai que o ARIA exige (axe aria-required-parent) */
import React from "react"

export default props => (
    <ul className="nav nav-tabs" role="tablist" aria-label={props.label}>
        {props.children}
    </ul>
)
/* Fim de TabsHeader.jsx */
