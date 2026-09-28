/* Cabeçalho de aba acessível (role="tab") ligado ao estado Redux */
import React, { Component } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"

import If from "../operator/If"
import { selectTab } from "./TabActions"

class TabHeader extends Component {
    render() {
        const { target, label, icon } = this.props
        const selected = this.props.tab.selected === target
        const visible = this.props.tab.visible[target]
        return (
            <If test={visible}>
                <li className={selected ? "active" : ""} role="presentation">
                    <button type="button" role="tab" id={`${target}-tab`} aria-selected={selected} aria-controls={target}
                        className="btn btn-link tab-button" onClick={() => this.props.selectTab(target)}>
                        <i className={`fa fa-${icon}`} aria-hidden="true"></i> {label}
                    </button>
                </li>
            </If>
        )
    }
}

const mapStateToProps = state => ({ tab: state.tab })
const mapDispatchToProps = dispatch => bindActionCreators({ selectTab }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(TabHeader)
/* Fim de TabHeader.jsx */
