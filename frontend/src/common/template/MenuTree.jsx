/* Grupo expansível do menu lateral (substitui o treeview do AdminLTE em jQuery) */
import React, { useState } from 'react'

export default props => {
    const [open, setOpen] = useState(true)
    return (
        <li className={`treeview ${open ? 'active menu-open' : ''}`}>
            <button type='button' className='btn btn-link treeview-toggle' aria-expanded={open} onClick={() => setOpen(!open)}>
                <i className={`fa fa-${props.icon}`} aria-hidden='true'></i><span>{props.label}</span>
                <i className='fa fa-angle-left pull-right' aria-hidden='true'></i>
            </button>
            <ul className='treeview-menu' style={{ display: open ? 'block' : 'none' }}>
                {props.children}
            </ul>
        </li>
    )
}
/* Fim de MenuTree.jsx */
