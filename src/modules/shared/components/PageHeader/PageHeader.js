import React from "react";

export function PageHeader(props) {
    return (
        <div className="z_page_header d-flex" style={{ padding: '30px 40px' }}>
            {props.children}
        </div>
    )
}