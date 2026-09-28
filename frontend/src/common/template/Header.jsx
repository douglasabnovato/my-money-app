/* Cabeçalho com logo, botão de recolher o menu lateral e menu do usuário */
import React from 'react'
import Navbar from './NavBar'

/* Alterna a classe do AdminLTE que recolhe/abre o menu lateral */
function toggleSidebar() {
    const body = document.body
    const mobile = window.innerWidth < 768
    body.classList.toggle(mobile ? 'sidebar-open' : 'sidebar-collapse')
}

export default () => (
    <header className='main-header'>
        <a href='#/' className='logo'>
            <span className='logo-mini'><b>My</b>M</span>
            <span className='logo-lg'><i className='fa fa-money' aria-hidden='true'></i><b> My</b> Money</span>
        </a>
        <nav className='navbar navbar-static-top' aria-label='Barra superior'>
            <button type='button' className='sidebar-toggle btn btn-link' onClick={toggleSidebar} aria-label='Mostrar ou esconder o menu'></button>
            <Navbar />
        </nav>
    </header>
)
/* Fim de Header.jsx */
