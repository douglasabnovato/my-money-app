import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getSummary } from './DashboardActions'

import ContentHeader from '../common/template/ContentHeader'
import Content from '../common/template/Content'
import ValueBox from  '../common/widget/ValueBox'
import Row from  '../common/layout/Row'
import { formatBRL } from '../common/format'

class Dashboard extends Component {

    componentDidMount() {
        this.props.getSummary()
    }

    render() {
        const { credit, debt } = this.props.summary
        const { error } = this.props
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
                            value={formatBRL(credit - debt)} text='Valor Consolidado' />
                    </Row> 
                </Content> 
            </div>
        )
    }
}

const mapStateToProps = state => ({ summary: state.dashboard.summary, error: state.dashboard.error })
const mapDispatchToProps = dispatch => bindActionCreators({getSummary}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)