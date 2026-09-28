import React, { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { Field, arrayInsert, arrayRemove } from "redux-form"
import Grid from "../common/layout/Grid"
import Input from "../common/form/Input"
import If from "../common/operator/If"

class ItemList extends Component {   
    
    add(index, item = {}){
         if(!this.props.readOnly){
             this.props.arrayInsert("billingCycleForm", this.props.field, index, item)
         }
    }

    remove(index){
        if(!this.props.readOnly && this.props.list.length > 1){
            this.props.arrayRemove("billingCycleForm", this.props.field, index)
        }
   }

    renderRows(){

        const list = this.props.list || []

        return list.map((item, index) => (
            <tr key={index}>
                <td><Field name={`${this.props.field}[${index}].name`} component={Input}
                        placeholder="Informe o nome" label={`${this.props.legend}: nome da linha ${index + 1}`} readOnly={this.props.readOnly}/></td>
                <td><Field name={`${this.props.field}[${index}].value`} component={Input}
                        placeholder="0,00" inputMode="decimal" label={`${this.props.legend}: valor da linha ${index + 1}`} readOnly={this.props.readOnly}/></td>
                <If test={this.props.showStatus}>
                    <td><Field name={`${this.props.field}[${index}].status`} component="select" className="form-control"
                        aria-label={`Status da linha ${index + 1}`} disabled={this.props.readOnly}>
                        <option value="">Status</option>
                        <option value="PAGO">Pago</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="AGENDADO">Agendado</option>
                    </Field></td>
                </If>
                <td>
                    <button type="button" className="btn btn-success" aria-label={`Adicionar linha após a ${index + 1}`}
                            onClick={() => this.add(index + 1)}>
                        <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                    <button type="button" className="btn btn-warning" aria-label={`Duplicar linha ${index + 1}`}
                            onClick={() => this.add(index + 1, item)}>
                        <i className="fa fa-clone" aria-hidden="true"></i>
                    </button>
                    <button type="button" className="btn btn-danger" aria-label={`Remover linha ${index + 1}`}
                            onClick={() => this.remove(index)}>
                        <i className="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                </td>
            </tr>
        )) 

    }

    render(){
        return(
            <Grid cols={this.props.cols}>
                <fieldset>
                    <legend>{this.props.legend}</legend>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Valor</th>
                                <If test={this.props.showStatus}>
                                    <th>Status</th>
                                </If>
                                <th className="table-actions">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderRows()}
                        </tbody>
                    </table>
                </fieldset>
            </Grid>
        )
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({ arrayInsert, arrayRemove }, dispatch)

export default connect(null, mapDispatchToProps)(ItemList)
