import React, { Fragment } from "react";
import { kFormatter } from "../../constants/currency";

function CurrencyFormatter(props) {
    return <div className="d-inline">{kFormatter(parseFloat(props.value))}</div>;
}

export default CurrencyFormatter;
