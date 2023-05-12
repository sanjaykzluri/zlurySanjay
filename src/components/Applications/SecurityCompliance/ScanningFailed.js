import React from "react";
import warning from "../../../components/Onboarding/warning.svg";

function ScanningFailed(props) {
    return (
        <div className={`d-flex flex-column justify-content-center align-items-center ml-3 mr-3 mb-3 bg-white ${props.className}`} style={{ height: "45vh" }}>
            <img src={warning} width={40} height={40} />
            <div className="font-14 text-center mt-3 warningMessage p-3 w-auto">
                There was an error rescanning. Please try again!
            </div>
        </div>
    );
}

export default ScanningFailed;