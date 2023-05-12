import React from 'react';
import './NoRenewalData.css';
import calender from '../../../../assets/icons/calender.svg';

export function NoRenewalData(props) {
    return (
        <div className="renewals__no_content">
           <div className="text-center">
               <img src={calender} className="ml-4" />
               <p className="z__header-ternary" style={{opacity:0.6}}> No Renewals Found </p>
            </div>  
        </div>
    )
}