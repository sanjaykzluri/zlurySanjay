import React, { useEffect, useState } from "react";

export default function ImpactStatus(props) {

    const IMPACTSTATUS = {
        LOW: {
            text: "LOW IMPACT",
            color: "#5FCF64"
        },
        MEDIUM: {
            text: "MEDIUM IMPACT",
            color: "#FFC117"
        },
        HIGH: {
            text: "HIGH IMPACT",
            color: "#FF6767"
        },
        VERYHIGH: {
            text: "VERY HIGH IMPACT",
            color: "#FF6767"
        }
    };

    const [impactData, setImpactData] = useState();

    const getImpactStatus = (impact) => {
        switch (impact) {
            case 5: return IMPACTSTATUS.VERYHIGH;
            case 4: return IMPACTSTATUS.HIGH;
            case 3: return IMPACTSTATUS.MEDIUM;
            case 2: return IMPACTSTATUS.LOW;
            case 1: return IMPACTSTATUS.LOW;
            default: return {
                text: "unavailable",
                color: "#717171",
            }
        }
    }

    useEffect(() => {
        const impactStyle = getImpactStatus(props.impact);
        setImpactData(impactStyle);
    }, [props.impact]);

    return (
        <div style={{ color: impactData?.color }} className="font-11 text-uppercase">
            {impactData?.text}
        </div>
    );
}