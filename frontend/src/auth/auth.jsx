import './auth.css'
import React, { Component } from 'react'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { login, signup } from './authActions'
import Row from '../common/layout/Row'
import Grid from '../common/layout/Grid'
import If from '../common/operator/If'
import Messages from '../common/msg/messages'
import Input from '../common/form/InputAuth'

class Auth extends Component {
    constructor(props) {
        super(props)
        this.state = { loginMode: true }
    }

    changeMode() {
        this.setState({ loginMode: !this.state.loginMode })
    }

    onSubmit(values) {
        const { login, signup } = this.props
        this.state.loginMode ? login(values) : signup(values)
    }

    render() {
        const { loginMode } = this.state
        const { handleSubmit } = this.props
        return (
            <main className="login-box">
                <h1 className="login-logo"><b> My</b> Money</h1>
                <div className="login-box-body">
                    <p className="login-box-msg">Bem vindo!</p>
                    <form onSubmit={handleSubmit(v => this.onSubmit(v))}>
                        <Field component={Input} type="text" name="name" autoComplete="name"
                            placeholder="Nome" icon='user' hide={loginMode} />
                        <Field component={Input} type="email" name="email" autoComplete="email"
                            placeholder="E-mail" icon='envelope' />
                        <Field component={Input} type="password" name="password" autoComplete={loginMode ? 'current-password' : 'new-password'}
                            placeholder="Senha" icon='lock' />
                        {!loginMode && <p className="help-block">Mínimo de 8 caracteres, com maiúscula, minúscula e número.</p>}
                        <Field component={Input} type="password" name="confirm_password" autoComplete="new-password"
                            placeholder="Confirmar senha" icon='lock' hide={loginMode} />
                        <Row>
                            <Grid cols="12 6">
                                <button type="submit"
                                    className="btn btn-primary btn-block btn-flat">
                                    {loginMode ? 'Entrar' : 'Registrar'}
                                </button>
                            </Grid>
                        </Row>
                    </form>
                    <br />
                    <button type="button" className="btn btn-link" onClick={() => this.changeMode()}>
                        {loginMode ? 'Novo usuário? Registrar aqui!' :
                            'Já é cadastrado? Entrar aqui!'}
                    </button>
                </div>
                <Messages />
            </main>
        )
    }
}

Auth = reduxForm({ form: 'authForm' })(Auth)

const mapDispatchToProps = dispatch => bindActionCreators({ login, signup }, dispatch)

export default connect(null, mapDispatchToProps)(Auth)