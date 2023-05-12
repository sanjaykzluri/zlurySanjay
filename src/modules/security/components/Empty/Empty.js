import React from "react";

import empty1 from "./empty1.svg";

export function Empty() {
    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ margin: "auto" }}
        >
            <img src={empty1} width={200} />
            <div className="empty-header">
                No Data
            </div>
        </div>
    );
}
