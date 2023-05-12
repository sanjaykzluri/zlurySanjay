import React from 'react';
import { MonthlyRenewalListView } from '../../components/MonthlyRenewalListView/MonthlyRenewalListView';
import './RenewalsListView.css';

export function RenewalsListView(props) {
    const monthlyRenewals = () =>  props.list.filter(ele=> ele.clubedRenewal().length).map((item, index) => <MonthlyRenewalListView data={item} key={index} />) 
    return (
        <div>{monthlyRenewals()}</div>
    )
}