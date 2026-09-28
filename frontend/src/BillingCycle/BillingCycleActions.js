import axios from "axios"
import consts from "../consts"
import { showErrors } from "../common/msg/errors"
import { toastr } from "react-redux-toastr"
import { reset as resetForm, initialize } from "redux-form"

import { showTabs, selectTab } from "../common/Tab/TabActions"

const BASE_URL = consts.API_URL
const INITIAL_VALUES = {credits: [{}], debts: [{}]}

export function getList(){
    const request = axios.get(`${BASE_URL}/billingCycles`) 
    return {
        type: "BILLING_CYCLES_FETCHED",
        payload: request
    }
}

export function create(values){ 
    return submit(values, "post")
}

export function update(values){
    return submit(values, "put")
}

export function remove(values){
    return submit(values, "delete")
}



function submit(values, method){
    return dispatch => {

        const id = values._id ? values._id : ""
        const { _id, userId, __v, createdAt, updatedAt, ...payload } = values

        axios[method](`${BASE_URL}/billingCycles/${id}`, payload) 
            .then(resp => {
                toastr.success("Sucesso", "Operação realizada com sucesso.") 
                dispatch(init())
            })
            .catch(showErrors)
    }
}

export function showUpdate(billingCycle){

    return [
        showTabs("tabUpdate"),
        selectTab("tabUpdate"),
        initialize("billingCycleForm", billingCycle)
    ]

}

export function showDelete(billingCycle){

    return [
        showTabs("tabDelete"),
        selectTab("tabDelete"),
        initialize("billingCycleForm", billingCycle)
    ]

}

export function init(){

    return [
        showTabs("tabList", "tabCreate"),
        selectTab("tabList"),
        getList(),
        initialize("billingCycleForm", INITIAL_VALUES)
    ]
    
}
