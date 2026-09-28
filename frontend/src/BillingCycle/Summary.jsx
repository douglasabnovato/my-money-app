import React from 'react'
import { formatBRL } from '../common/format'

import Grid from '../common/layout/Grid'
import Row from '../common/layout/Row'
import ValueBox from '../common/widget/ValueBox'

export default ({credit, debt}) => (
    <Grid cols='12'>
        <fieldset>
            <legend>Resumo</legend>
            <Row>
                <ValueBox cols='12 4' color='green' icon='bank'
                    value={formatBRL(credit)} text='Total de Créditos' />
                <ValueBox cols='12 4' color='red' icon='credit-card'
                    value={formatBRL(debt)} text='Total de Débitos' />
                <ValueBox cols='12 4' color='blue' icon='money'
                    value={formatBRL(credit - debt)} text='Valor Consolidado' />
            </Row>
        </fieldset>
    </Grid>
)