import React from "react";
import { Link } from "react-router-dom";
import arrowRight from '../../../../assets/icons/arrow-right.svg';
import { PageHeader } from "../PageHeader/PageHeader";


export function BreadCrumbHeader(props) {
    return (
        <PageHeader>
            <div className="z__breadcrum_header d-flex w-100">
                <Link to={props.to} className="text-decoration-none mr-2">
                    <h3 className="font-22 black-1 bold-600 o-6">{props.toTitle}</h3>
                </Link>
                <img src={arrowRight} className="mt-n1 mr-2" />
                {props.children}
            </div>
        </PageHeader>
    );
}
