import React from "react";

export function CustomFieldCard(props) {
    return (
        <>
            <div className="cf-card mb-3 p-2 pl-3 pr-3 mr-3 pointer" onClick={() => props.onEdit(props.field)} >
                <div className="mb-1"><p className="z__header-ternary bold-400 m-0">{props.field.name}</p></div>
                <div><p className="z__description-secondary text-capitalize m-0">{props.field.type} Type</p></div>
            </div>
        </>
    );
}