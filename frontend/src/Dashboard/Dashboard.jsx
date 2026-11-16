import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getSummary } from './DashboardActions'

import ContentHeader from '../common/template/ContentHeader'
import Content from '../common/template/Content'
import ValueBox from  '../common/widget/ValueBox'
import Row from  '../common/layout/Row'
import { consolidar, formatBRL, formatPercent } from '../common/format'

/* Frase sobre a parte dos créditos que sobrou depois dos débitos */
export function fraseTaxa({ taxa, saldo }) {
    if (taxa === null) return 'Cadastre créditos para ver quanto sobra.'
    if (saldo < 0) return `Os débitos passam dos créditos em ${formatBRL(-saldo)}.`
    return `Sobraram ${formatPercent(taxa)} dos créditos.`
}

export class Dashboard extends Component {

    componentDidMount() {
        this.props.getSummary()
    }

    render() {
        const resumo = consolidar(this.props.summary)
        const { credit, debt, saldo } = resumo
        const { error, loading } = this.props
        return (
            <div> 
                <ContentHeader title='Dashboard' small='Versão 1.0' />
                <Content>
                    {error && <p className='alert alert-warning' role='alert'>Não foi possível atualizar o resumo. Verifique a conexão.</p>}
                    <Row> 
                        <ValueBox cols='12 4' color='green' icon='bank'
                            value={formatBRL(credit)} text='Total de Créditos' />
                        <ValueBox cols='12 4' color='red' icon='credit-card'
                            value={formatBRL(debt)} text='Total de Débitos' />
                        <ValueBox cols='12 4' color='blue' icon='money'
                            value={formatBRL(saldo)} text='Valor Consolidado' />
                    </Row> 
                    <p className='lead' role='status'>{loading ? 'Carregando o resumo…' : fraseTaxa(resumo)}</p>
                </Content> 
            </div>
        )
    }
}

const mapStateToProps = state => ({ summary: state.dashboard.summary, error: state.dashboard.error, loading: state.dashboard.loading })
const mapDispatchToProps = dispatch => bindActionCreators({getSummary}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)