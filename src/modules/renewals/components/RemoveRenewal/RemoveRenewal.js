import React from 'react';
import { Button } from "../../../../UIComponents/Button/Button";
import exclamation from '../../../../assets/icons/exclamation.svg';

export function RemoveRenewal(props) {
    return (
        <div>
            <h3 className="z__header-secondary">Renewal</h3>
            <hr />
            <div className="row">
                <div className="col-md-12 md-4  text-center">
                    <img src={exclamation} width={40} />
                    <p className="z__description-highlight mt-2">Sure you want to remove the Renewal info for {props.renewal.name}?</p>
                    <p className="z__description-secondary">You cannot undo this action once taken.</p>
                </div>
            </div>
            <div className="col-md-12 mt-4 mr text-right">
                <Button onClick={() => props.onDelete()}> Remove Renewal </Button>
                <Button onClick={() => props.onCancel()} type="link" className="mr-4"> Cancel </Button>
            </div>
        </div>
    )
}