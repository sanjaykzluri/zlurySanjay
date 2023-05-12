import React from "react";
import "./SecurityProbes.css";

function ScanResultTemplate(props) {
    return (
        <div>
            <div className="font-18">Scan Result for {props.probeName}</div>
            <div className="bg-white security_probes_card d-flex flex-row p-3 mt-2 mr-4">
                <div className="d-flex flex-column ml-2 mr-2 security_probes_card_column">
                    {props.leftSideElements}
                </div>
                <div className="d-flex flex-column ml-2 mr-2 security_probes_card_column w-100 pl-4">
                    {props.rightSideElements}
                </div>
            </div>
        </div>
    );
}

export default ScanResultTemplate;
