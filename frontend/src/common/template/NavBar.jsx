/* Menu do usuário: iniciais no lugar da foto (lorempixel foi desativado) e botão de sair */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { logout } from '../../auth/authActions'

/* Duas primeiras iniciais do nome */
function initials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
}

class Navbar extends Component {
    constructor(props) {
        super(props)
        this.state = { open: false }
    }

    /* Abre ou fecha o menu */
    toggle(open = !this.state.open) {
        this.setState({ open })
    }

    render() {
        const { name, email } = this.props.user
        const { open } = this.state
        return (
            <div className='navbar-custom-menu'>
                <ul className='nav navbar-nav'>
                    <li className={`dropdown user user-menu ${open ? 'open' : ''}`}
                        onKeyDown={e => e.key === 'Escape' && this.toggle(false)}>
                        <button type='button' className='dropdown-toggle btn btn-link' aria-expanded={open} aria-haspopup='true'
                            onClick={() => this.toggle()}>
                            <span className='user-image avatar-initials' aria-hidden='true'>{initials(name)}</span>
                            <span className='hidden-xs'>{name}</span>
                        </button>
                        <ul className='dropdown-menu'>
                            <li className='user-header'>
                                <span className='img-circle avatar-initials avatar-lg' aria-hidden='true'>{initials(name)}</span>
                                <p>{name}<small>{email}</small></p>
                            </li>
                            <li className='user-footer'>
                                <div className='pull-right'>
                                    <button type='button' onClick={this.props.logout} className='btn btn-default btn-flat'>Sair</button>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        )
    }
}

const mapStateToProps = state => ({ user: state.auth.user })
const mapDispatchToProps = dispatch => bindActionCreators({ logout }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Navbar)
/* Fim de NavBar.jsx */
