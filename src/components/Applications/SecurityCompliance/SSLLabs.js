import React from "react";
import ScanResultTemplate from "./ScanResultTemplate";
import ShowMoreText from "react-show-more-text";
import { Table } from "../../../common";
import _ from "underscore";
import Grade from "./Grade";
import common_empty from "../../../assets/common/common_empty.png";

function SSLLabs(props) {

    const renderSummaryRow = (label, value, className) => {
        return (
            <div className="d-flex flex-row scan_summary">
                <div className="grey label">{label}</div>
                <div className={`font-13 value ${className} ${!value && 'o-6'}`}>
                    {value || 'data unavailable'}
                </div>
            </div>
        );
    }

    const renderRowDetail = (key, value, showLightGreyBg, className) => {
        return (
            <div className={`d-flex flex-row security_probes_card_column mt-0 mb-0 p-3 ${showLightGreyBg && "lightGreyBg"}`}>
                <div className="label text-capitalize">
                    {key?.split("_")?.join(" ")}
                </div>
                <div className={`value align-self-center ${className}`}>
                    {
                        (value && Array.isArray(value)) ?
                            <ShowMoreText
                                lines={1}
                                more="View more"
                                less="View less"
                                expanded={false}
                            >
                                {
                                    value.map((v, index) => (
                                        <span>{index > 0 && ', '}{v}</span>
                                    ))
                                }
                            </ShowMoreText>
                            :
                            _.isBoolean(value) ?
                                <div className={`${value ? "authorized_green" : "unauthorized_red"} text-capitalize`}>
                                    {value.toString()}
                                </div>
                                :
                                value
                    }
                </div>
            </div>
        );
    }

    const getSummaryDetails = (summaryDetails) => {
        return (
            <>
                {renderSummaryRow("Certificate Score", summaryDetails?.certificate_score, "grey-1")}
                {renderSummaryRow("Protocol Support Score", summaryDetails?.protocol_support_score, "grey-1")}
                {renderSummaryRow("Key Exchange Score", summaryDetails?.key_exchange_score, "grey-1")}
                {renderSummaryRow("Cipher Strength Score", summaryDetails?.cipher_strength_score, "grey-1")}
                {renderSummaryRow("Certificate Serial No", summaryDetails?.certificate1_serial_no, "grey-1")}
                {renderSummaryRow("Valid From", summaryDetails?.valid_from, "grey-1")}
                {renderSummaryRow("Valid Until", summaryDetails?.valid_until, "grey-1")}
                {renderSummaryRow("Key", summaryDetails?.key, "grey-1")}
                {renderSummaryRow("Signature Algorithm", summaryDetails?.signature_algorithm, "grey-1")}
            </>
        )
    }

    const defaultColumn = (value, className) => {
        return (
            <div className={`${className} ${!value && 'o-6'}`}>
                {value}
            </div>
        )
    }

    const certification_columns = [
        {
            dataField: "subject",
            text: "Subject",
            formatter: (dataField) => (
                defaultColumn(dataField, "font-14 grey text-nowrap")
            ),
        },
        {
            dataField: "common_names",
            text: "Common Names",
            formatter: (dataField) => (
                <>
                    {
                        dataField ?
                            <div className="font-13 grey-1 d-flex flex-column">
                                {
                                    dataField && Array.isArray(dataField) && dataField.map((name) => (
                                        <div>
                                            {name}
                                        </div>
                                    ))
                                }
                            </div>
                            :
                            defaultColumn(dataField, "font-13 grey text-nowrap")
                    }
                </>
            ),
        },
        {
            dataField: "alternative_names",
            text: "Alternate Names",
            formatter: (dataField) => (
                <>
                    {
                        dataField ?
                            <div className="font-13 grey-1 d-flex flex-column">
                                {
                                    dataField && Array.isArray(dataField) && dataField.map((name) => (
                                        <div>
                                            {name}
                                        </div>
                                    ))
                                }
                            </div>
                            :
                            defaultColumn(dataField, "font-13 grey text-nowrap")
                    }
                </>
            ),
        },
        {
            dataField: "serial_no",
            text: "Serial No",
            formatter: (dataField) => (
                defaultColumn(dataField, "font-13 grey text-nowrap")
            ),
        },
        {
            dataField: "valid_from",
            text: "Valid From",
            formatter: (dataField) => (
                defaultColumn(dataField, "font-13 grey text-nowrap")
            ),
        },
    ];

    const protocol_columns = [
        {
            dataField: "protocol_type",
            text: "Protocol Type",
            formatter: (dataField) => (
                defaultColumn(dataField, "font-14 grey")
            ),
        },
        {
            dataField: "protocol_exists",
            text: "Protocol Exists",
            formatter: (dataField) => (
                <div className={`font-13 text-capitalize ${_.isBoolean(dataField) ? (dataField ? "authorized_green" : "unauthorized_red") : (dataField ? 'grey' : 'grey o-6')}`}>
                    {
                        _.isBoolean(dataField) ?
                            dataField.toString()
                            :
                            (dataField || "data unavailable")
                    }
                </div>
            ),
        },
    ];

    return (
        <div className="d-flex flex-column m-4">
            <div className="mb-4">
                <ScanResultTemplate
                    probeName={props.probeDetails?.name}
                    leftSideElements={
                        <Grade className="scan_summary_grade" value={props.probeDetails?.summary?.overall_rating || ""} />
                    }
                    rightSideElements={getSummaryDetails(props.probeDetails?.summary)}
                />
            </div>
            <div className="mb-4">
                <div className="font-18">
                    RSA 2048 Certificate
                </div>
                {
                    props.probeDetails?.certificates && Array.isArray(props.probeDetails?.certificates) && (props.probeDetails?.certificates.length > 0) ?
                        <div className="bg-white p-2 mr-4 mt-2 table_scroll_sm" style={{ borderRadius: "6px" }}>
                            <Table
                                headerCSSClasses="table_headers grey-1 o-7 font-11 text-nowrap"
                                data={props.probeDetails?.certificates}
                                columns={certification_columns}
                                remote={false}
                            />
                        </div>
                        :
                        <div className="d-flex flex-column p-3 bg-white mb-3" style={{ height: "30vh", borderRadius: "6px" }}>
                            <img src={common_empty} className="mt-auto ml-auto mr-auto" />
                            <div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
                                Nothing here :)
                            </div>
                        </div>
                }
            </div>
            <div className="mb-4">
                <div className="font-18">
                    Configuration
                </div>
                <div className="row ml-0 mr-0 mt-3">
                    <div className="col-md-6 p-0">
                        <div className="font-16 mb-2">
                            Protocol Details
                        </div>
                        {
                            props.probeDetails?.protocol_details && (_.without(_.flatten(_.values(props.probeDetails?.protocol_details)), '', "", [], {}, null, undefined).length > 0) ?
                                <div className="bg-white mr-4 mt-2" style={{ borderRadius: "6px" }}>
                                    <div className="mr-0 mt-2 d-flex flex-column listViewDetails bg-white security_probes_card" style={{ borderRadius: "6px" }}>
                                        {
                                            props.probeDetails?.protocol_details && Object.keys(props.probeDetails?.protocol_details).length > 0 &&
                                            Object.keys(props.probeDetails?.protocol_details).map((key, index) => (
                                                renderRowDetail(key, props.probeDetails?.protocol_details[key], index % 2 === 0)
                                            ))
                                        }
                                    </div>
                                </div>
                                :
                                <div className="d-flex flex-column p-3 bg-white mb-3 mr-3" style={{ height: "30vh", borderRadius: "6px" }}>
                                    <img src={common_empty} className="mt-auto ml-auto mr-auto" />
                                    <div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
                                        No protocol details :)
                                    </div>
                                </div>
                        }
                    </div>
                    <div className="col-md-6 p-0">
                        <div className="font-16 mb-2">
                            Protocol
                        </div>
                        {
                            props.probeDetails?.protocol && Array.isArray(props.probeDetails?.protocol) && (props.probeDetails?.protocol.length > 0) ?
                                <div className="bg-white p-2 mr-4 mt-2" style={{ borderRadius: "6px" }}>
                                    <Table
                                        headerCSSClasses="table_headers grey-1 o-7 font-11"
                                        data={props.probeDetails?.protocol}
                                        columns={protocol_columns}
                                        remote={false}
                                    />
                                </div>
                                :
                                <div className="d-flex flex-column p-3 bg-white mb-3" style={{ height: "30vh", borderRadius: "6px" }}>
                                    <img src={common_empty} className="mt-auto ml-auto mr-auto" />
                                    <div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
                                        No protocol types :)
                                    </div>
                                </div>
                        }
                        <div className="font-16 mt-4 mb-2">
                            Miscellaneous
                        </div>
                        {
                            props.probeDetails?.miscellaneous && (_.without(_.flatten(_.values(props.probeDetails?.miscellaneous)), '', "", [], {}, null, undefined).length > 0) ?
                                <div className="bg-white mr-4 mt-2" style={{ borderRadius: "6px" }}>
                                    <div className="mr-0 mt-2 d-flex flex-column listViewDetails bg-white security_probes_card" style={{ borderRadius: "6px" }}>
                                        {
                                            props.probeDetails?.miscellaneous && Object.keys(props.probeDetails?.miscellaneous).length > 0 &&
                                            Object.keys(props.probeDetails?.miscellaneous).map((key, index) => (
                                                renderRowDetail(key, props.probeDetails?.miscellaneous[key], index % 2 === 0)
                                            ))
                                        }
                                    </div>
                                </div>
                                :
                                <div className="d-flex flex-column p-3 bg-white mb-3" style={{ height: "30vh", borderRadius: "6px" }}>
                                    <img src={common_empty} className="mt-auto ml-auto mr-auto" />
                                    <div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2 pl-2 pr-2">
                                        No miscellaneous info available :)
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SSLLabs;