import React, { useContext, useEffect, useState, Fragment } from "react";
import { DottedRisk, getRiskStatus } from "../../../../common/DottedRisk/DottedRisk";
import { fetchUsageActivityRiskDetails } from "../../../../services/api/users";
import { Accordion, Card, Badge } from 'react-bootstrap';
import check from '../../../../components/Integrations/greenTick.svg';
import caret from '../../../../components/Integrations/caret.svg';
import ContentLoader from "react-content-loader";
import _ from "underscore";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg"
import warning from "../../../../components/Onboarding/warning.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import noteAndPencil from "../../../../assets/noteAndPencil.png";

function UsageActivityRisk(props) {

    const [usageActivityRisk, setUsageActivityRisk] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const badge = {
        fontSize: "10px",
        lineHeight: "13px",
        opacity: "0.5",
        border: "0.5px solid #DDDDDD",
        fontWeight: "normal",
        padding: "2px 5px",
        height: "fit-content"
    }

    const requestEndPoint = () => {
        setLoading(true);
        try {
            fetchUsageActivityRiskDetails(props.id).then((res) => {
                if (res?.error) {
                    setError(res);
                } else {
                    setUsageActivityRisk(res?.data);
                    setError();
                }
                setLoading(false);
            })
        } catch (error) {
            setError(error);
            setLoading(false);
            console.log("Error when fetching risk for usage activity", error);
        }
    }

    useEffect(() => {
        if (props.currentSection === props.sections.risk) {
            requestEndPoint();
        } else {
            setUsageActivityRisk();
            setError();
            setLoading(true);
        }
    }, [props.currentSection]);

    return (
        <div className="position-relative" style={{ height: "calc(100vh - 112px)", overflowY: "auto" }} >
            {
                error ?
                    <div className="d-flex flex-column justify-content-center" style={{ height: "100%" }}>
                        <img src={warning} style={{ width: "45px" }} className="ml-auto mr-auto" />
                        <div className="grey-1 font-18 bold-normal w-75 text-center ml-auto mr-auto mt-2">
                            An error occured. Please try again
                        </div>
                        {/* <div className="grey-1 o-5 font-14 bold-normal">

                    </div> */}
                        <div className="ml-auto mr-auto mt-2">
                            <Button className="primary-color-border d-flex" type="link" onClick={() => requestEndPoint()}>
                                <img src={refershBlue} className="mr-2" style={{ width: "15px" }} />
                                Retry
                            </Button>
                        </div>
                    </div>
                    :
                    <>
                        <div className="borderStyling p-3 m-3">
                            <div className="d-flex flex-row">
                                {
                                    loading ?
                                        <ContentLoader width={91} height={12}>
                                            <rect width="91" height="12" rx="2" fill="#EBEBEB" />
                                        </ContentLoader>
                                        :
                                        <div className="grey font-16 bold-600">RISK LEVEL</div>
                                }
                                <div className="ml-auto w-25">
                                    <DottedRisk size="large" value={usageActivityRisk?.risk_level || 0} loading={loading} />
                                </div>
                            </div>
                            <div className="d-flex flex-row">
                                {
                                    loading ?
                                        <ContentLoader width={91} height={10}>
                                            <rect width="91" height="10" rx="2" fill="#EBEBEB" />
                                        </ContentLoader>
                                        :
                                        <Fragment>
                                            <div className="font-13 grey-1 bold-normal mt-1">{usageActivityRisk?.authorized_scope_count || 0} authorized scopes</div>
                                            <div className="ml-auto text-capitalize font-13 grey-1 o-5 mt-1">{usageActivityRisk?.risk_level ? `${getRiskStatus(usageActivityRisk?.risk_level)} Risk` : 'Risk unavailable'}</div>
                                        </Fragment>
                                }
                            </div>
                        </div>
                        {
                            loading ?
                                <>
                                    {
                                        _.times(2, ((n) => (
                                            <div key={n}>
                                                <div className="d-flex border-bottom pt-3 mr-3 mt-3 ml-3">
                                                    <ContentLoader height={50} width={200}>
                                                        <circle r="15" cx="22" cy="20" fill="#EBEBEB" />
                                                        <rect width="100" x="50" y="15" height="10" rx="2" fill="#EBEBEB" />
                                                    </ContentLoader>
                                                </div>
                                                <div style={{ borderBottom: "0.5px solid #EBEBEB" }} className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3">
                                                    <ContentLoader width={500} height={50}>
                                                        <rect width="160" height="10" rx="2" fill="#EBEBEB" />
                                                        <rect width="91" height="10" rx="2" y={20} fill="#EBEBEB" />
                                                        <rect width="20" y="20" rx="5" height="10" x="120" />
                                                        <rect width="20" y="20" rx="5" height="10" x="145" />
                                                        <rect width="20" y="20" rx="5" height="10" x="170" />
                                                        <rect width="20" y="20" rx="5" height="10" x="195" />
                                                        <rect width="20" y="20" rx="5" height="10" x="220" />
                                                    </ContentLoader>
                                                </div>
                                                <div style={{ borderBottom: "0.5px solid #EBEBEB" }} className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3">
                                                    <ContentLoader width={500} height={50}>
                                                        <rect width="280" height="10" rx="2" fill="#EBEBEB" />
                                                        <rect width="130" height="10" rx="2" y={20} fill="#EBEBEB" />
                                                        <rect width="20" y="20" rx="5" height="10" x="150" />
                                                        <rect width="20" y="20" rx="5" height="10" x="175" />
                                                        <rect width="20" y="20" rx="5" height="10" x="200" />
                                                        <rect width="20" y="20" rx="5" height="10" x="225" />
                                                        <rect width="20" y="20" rx="5" height="10" x="250" />
                                                    </ContentLoader>
                                                </div>
                                                <div style={{ borderBottom: "0.5px solid #EBEBEB" }} className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 d-flex flex-row pt-3">
                                                    <ContentLoader width={500} height={50}>
                                                        <rect width="160" height="10" rx="2" fill="#EBEBEB" />
                                                        <rect width="91" height="10" rx="2" y={20} fill="#EBEBEB" />
                                                        <rect width="20" y="20" rx="5" height="10" x="120" />
                                                        <rect width="20" y="20" rx="5" height="10" x="145" />
                                                        <rect width="20" y="20" rx="5" height="10" x="170" />
                                                        <rect width="20" y="20" rx="5" height="10" x="195" />
                                                        <rect width="20" y="20" rx="5" height="10" x="220" />
                                                    </ContentLoader>
                                                </div>
                                            </div>
                                        )))
                                    }
                                </>
                                :
                                usageActivityRisk?.grouped_scopes && _.isObject(usageActivityRisk?.grouped_scopes) && usageActivityRisk?.source_data && Array.isArray(usageActivityRisk?.source_data) &&
                                usageActivityRisk?.source_data?.map((sourceGroup) => (
                                    <>
                                        <div className="d-flex border-bottom p-3 ml-3 mr-3 mt-3">
                                            <img src={sourceGroup?.logo_url} style={{ width: "30px" }} className="mr-2" />
                                            <div className="d-flex flex-column">
                                                <div className="font-16 grey bold-normal">
                                                    {sourceGroup?.name}
                                                </div>
                                                <div className="font-9 grey-1 bold-normal">
                                                    Integrations details not available from server
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            (usageActivityRisk?.grouped_scopes && _.isObject(usageActivityRisk?.grouped_scopes) && Array.isArray(usageActivityRisk?.grouped_scopes[sourceGroup?.keyword]) && usageActivityRisk?.grouped_scopes[sourceGroup?.keyword].length > 0) ?
                                                <Accordion>
                                                    {
                                                        usageActivityRisk?.grouped_scopes[sourceGroup?.keyword].map((source, index) => (
                                                            <Card style={{ borderBottom: "0.5px solid #EBEBEB" }} className="border-left-0 border-top-0 border-right-0 ml-3 mr-3" key={index}>
                                                                <Card.Header
                                                                    style={{ padding: "0" }}
                                                                    className="bg-white border-0"
                                                                >
                                                                    <Accordion.Toggle
                                                                        style={{ color: "#484848", fontSize: "13px", border: "0", padding: "16px 12px", cursor: "initial" }}
                                                                        as={Card.Header}
                                                                        className="bg-white d-flex"
                                                                        variant="link"
                                                                        eventKey={source._id}
                                                                    >
                                                                        <div className="d-flex flex-row">
                                                                            <img className="mr-2 mt-2 mb-auto" src={check}></img>
                                                                            <div className="d-flex flex-column">
                                                                                <div className="d-flex flex-row">
                                                                                    {source.title}
                                                                                    <div className="mr-auto mt-auto mb-auto ml-2">
                                                                                        <Badge className="ml-1 mr-1 textColor text-uppercase" style={badge} pill variant="light">{source.read_only ? "read only" : "write"}</Badge>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="d-flex flex-row mt-2">
                                                                                    <div className="text-uppercase grey-1 o-5 bold-600 font-11 mr-2">Risk level</div>
                                                                                    <DottedRisk size="sm" value={source.risk || 0} />
                                                                                    <div className="font-11 grey-1 o-5 bold-normal ml-2 text-capitalize">{getRiskStatus(source.risk || 0)}</div>
                                                                                </div>
                                                                            </div>
                                                                            {/* <img className="ml-1 mt-2 mb-auto" src={caret}></img> */}
                                                                        </div>
                                                                    </Accordion.Toggle>
                                                                </Card.Header>
                                                                {/* <Accordion.Collapse eventKey={source._id}>
                                                <Card.Body className="ml-2 pl-4 textColor pt-2">{"description will be added soon"}</Card.Body>
                                            </Accordion.Collapse> */}
                                                            </Card>
                                                        ))
                                                    }
                                                </Accordion>
                                                :
                                                <div className="d-flex flex-column" style={{ height: "180px" }}>
                                                    <img src={noteAndPencil} style={{ width: "240px" }} className="mt-auto ml-auto mr-auto" />
                                                    <div className="font-13 grey-1 bold-normal text-center ml-auto mr-auto mt-2 mb-auto">There are no scopes to show</div>
                                                </div>
                                        }
                                    </>
                                ))
                        }
                    </>
            }
        </div>
    );
}

export default UsageActivityRisk;