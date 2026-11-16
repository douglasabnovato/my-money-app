/* Caixa de valor do painel: o valor é texto em destaque, não título (WAI, Headings; #24) */
import React from "react"
import Grid from "../layout/Grid"

export default props => (
    <Grid cols={props.cols}>
        <div className={`small-box bg-${props.color}`}> 
            <div className="inner">
                <p className="small-box-valor">{props.value}</p>
                <p>{props.text}</p>
            </div> 
            <div className="icon">
                <i className={`fa fa-${props.icon}`}></i>
            </div>
        </div>
    </Grid>
)
