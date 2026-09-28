/* Item do menu lateral */
import React from 'react'

export default props => (
    <li>
        <a href={props.path}>
            <i className={`fa fa-${props.icon}`} aria-hidden='true'></i><span>{props.label}</span>
        </a>
    </li>
)
/* Fim de MenuItem.jsx */
