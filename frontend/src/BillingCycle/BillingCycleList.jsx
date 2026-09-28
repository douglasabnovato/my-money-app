import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getList, showUpdate, showDelete } from './BillingCycleActions'
import { MONTHS } from './BillingCycleForm'

class BillingCycleList extends Component {

    componentDidMount() {
        this.props.getList()
    }

    renderRows() {
        const list = this.props.list || []
        return list.map(bc => (
            <tr key={bc._id}>
                <td>{bc.name}</td>
                <td>{MONTHS[bc.month - 1] || bc.month}</td>
                <td>{bc.year}</td>
                <td>
                    <button type='button' className='btn btn-warning' aria-label={`Alterar ${bc.name}`} onClick={() => this.props.showUpdate(bc)}>
                        <i className='fa fa-pencil' aria-hidden='true'></i>
                    </button>
                    <button type='button' className='btn btn-danger' aria-label={`Excluir ${bc.name}`} onClick={() => this.props.showDelete(bc)}>
                        <i className='fa fa-trash-o' aria-hidden='true'></i>
                    </button>
                </td>
            </tr>
        ))
    }

    render() {
        const { list = [], error } = this.props
        return (
            <div>
                {error && <p className='alert alert-warning' role='alert'>Não foi possível carregar os ciclos. Verifique a conexão.</p>}
                {!error && list.length === 0 && <p className='text-muted'>Nenhum ciclo cadastrado. Use a aba “Incluir”.</p>}
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Mês</th>
                            <th>Ano</th>
                            <th className='table-actions'>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRows()}
                    </tbody>
                </table>
            </div>
        )
    }
}

const mapStateToProps = state => ({ list: state.billingCycle.list, error: state.billingCycle.error })
const mapDispatchToProps = dispatch => bindActionCreators({getList, showUpdate, showDelete}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(BillingCycleList)
