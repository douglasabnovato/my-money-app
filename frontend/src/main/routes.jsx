/* Rotas da área autenticada (React Router 7) */
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from '../Dashboard/Dashboard'
import BillingCycle from '../BillingCycle/BillingCycle'

export default () => (
    <main className='content-wrapper' id='conteudo'>
        <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/billingCycles' element={<BillingCycle />} />
            <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
    </main>
)
/* Fim de routes.jsx */
