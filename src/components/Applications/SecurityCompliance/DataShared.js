import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationDataSharedInfo } from "../../../actions/applications-action";
import "./DataShared.css";
import { Accordion, Card, Badge } from 'react-bootstrap';
import { unescape } from "../../../utils/common";
import check from '../../Integrations/greenTick.svg';
import caret from '../../Integrations/caret.svg';
import RiskModal from "../../../modules/security/components/Modal/RiskModal";
import { NameBadge } from "../../../common/NameBadge";
import Rating from "./Rating";
import _ from "underscore";
import common_empty from "../../../assets/common/common_empty.png";
import ContentLoader from "react-content-loader";
import warning from "../../Onboarding/warning.svg"
import { Button } from "../../../UIComponents/Button/Button";
import ThreatLoader from "./ThreatLoader";

export default function DataShared(props) {

    const dispatch = useDispatch();
    const dataShared = useSelector((state) => state.applications.singleappSecurityDataShared[props.application?.app_id])
    const [loading, setLoading] = useState(false);
    const [dataSharedInfo, setDataSharedInfo] = useState();
    const [showModal, setShowModal] = useState(false);
    const [showErrorScreen, setShowErrorScreen] = useState(false);

    useEffect(() => {
        if (props.application) {
            dispatch(fetchApplicationDataSharedInfo(props.application.app_id))
        }
    }, [props.application]);

    const handleRetry = () => {
        dispatch(fetchApplicationDataSharedInfo(props.application?.app_id))
    }

    const getThreatType = (threat) => {
        if (threat <= 2) {
            return "Low Threat";
        } else if (threat === 3) {
            return "Medium Threat";
        } else if (threat >= 4) {
            return "High Threat";
        }
    }

    const badge = {
        fontSize: "10px",
        lineHeight: "13px",
        opacity: "0.5",
        border: "0.5px solid #DDDDDD",
        fontWeight: "normal",
        padding: "2px 5px",
        height: "fit-content"
    }

    useEffect(() => {
        setLoading(true);
        if (!dataShared?.loading && dataShared?.data && Object.keys(dataShared?.data)?.length > 0) {
            let isEmptyResponse = true;
            _.each(dataShared.data, (data) => {
                if (!_.isEmpty(data)) {
                    isEmptyResponse = false;
                }
            });
            if (!isEmptyResponse && dataShared.data) {
                setDataSharedInfo(dataShared.data);
                setShowErrorScreen(false);
            }
            setLoading(false);
        } else if (dataShared?.error) {
            setShowErrorScreen(true);
        }
    }, [dataShared]);

    const handleShowUsers = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowModal(true);
    }

    return (
        <>
            {
                showErrorScreen ?
                    <div className="d-flex flex-column p-3" style={{ height: "50vh" }}>
                        <img src={warning} className="ml-auto mr-auto mt-auto" style={{ width: "45.42px" }} />
                        <div className="grey-1 font-18 text-center mt-2">An error occured. Please try again</div>
                        <Button className="btn btn-outline-primary ml-auto mr-auto mt-2 mb-auto" onClick={handleRetry}>
                            <div className="font-13">
                                Retry
                            </div>
                        </Button>
                    </div>
                    :
                    <>
                        {
                            loading ?
                                <ThreatLoader />
                                : (dataSharedInfo && Object.keys(dataSharedInfo)?.length > 0) ?
                                    <div className="d-flex flex-column m-4 border rounded">
                                        <div className="threatsHeading p-4">
                                            <div className="d-flex flex-row">
                                                <div className="grey font-16 bold-600 text-uppercase">
                                                    Threat
                                                </div>
                                                {
                                                    dataSharedInfo.app_max_threat &&
                                                    <div className="ml-auto">
                                                        <Rating rating={dataSharedInfo.app_max_threat} iconType="scope" width="13.8" height="15.36" />
                                                    </div>
                                                }
                                            </div>
                                            <div className="d-flex flex-row">
                                                {
                                                    dataSharedInfo.app_threats_count &&
                                                    <div className="grey-1 font-13">
                                                        {dataSharedInfo.app_threats_count} factors compromising security
                                                    </div>
                                                }
                                                {
                                                    dataSharedInfo.app_max_threat &&
                                                    <div className="grey-1 font-13 o-6 ml-auto">
                                                        Level {dataSharedInfo.app_max_threat}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="bg-white pl-4 pr-4 pb-4">
                                            {
                                                dataSharedInfo.app_threats && Array.isArray(dataSharedInfo.app_threats) && dataSharedInfo.app_threats.map((threat, index) => (
                                                    <Card style={{ borderBottom: "0.5px solid #EBEBEB" }} className="border-left-0 border-top-0 border-right-0">
                                                        <Card.Header
                                                            style={{ padding: "0" }}
                                                            className="bg-white border-0"
                                                        >
                                                            <Accordion.Toggle
                                                                style={{ padding: "16px 3px" }}
                                                                as={Card.Header}
                                                                className="bg-white d-flex border-0 font-13 grey"
                                                                variant="link"
                                                                eventKey={index}
                                                            >
                                                                <div className="d-flex flex-column w-100">
                                                                    <div className="d-flex flex-row">
                                                                        <img className="mr-2 mb-auto" style={{ marginTop: "6px" }} src={check}></img>
                                                                        <div className="font-13 grey flex-wrap">
                                                                            {threat.scope.title}
                                                                        </div>
                                                                        <div className="ml-2 mt-0 mb-auto mr-1">
                                                                            <Badge className="ml-1 mr-1 textColor font-10 pl-2 pr-2" style={badge} pill variant="light">
                                                                                {
                                                                                    threat.scope.read_only ?
                                                                                        "READ ONLY"
                                                                                        : "READ & WRITE"
                                                                                }
                                                                            </Badge>
                                                                        </div>
                                                                        {
                                                                            <div
                                                                                className="font-12 primary-color ml-auto cursor-pointer text-nowrap"
                                                                                onClick={(e) => handleShowUsers(e)}
                                                                                style={{
                                                                                    marginTop: '3px',
                                                                                }}
                                                                            >
                                                                                Show {threat.user_count} {threat.user_count > 1 ? 'users' : 'user'}
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    <div className="d-flex flex-row mt-2" style={{ paddingLeft: "21px" }}>
                                                                        {
                                                                            threat.scope.source &&
                                                                            <>
                                                                                <div className="grey-1 font-11 mt-1 o-5">
                                                                                    via
                                                                                </div>
                                                                                {
                                                                                    threat.scope.source === "gsuite" ?
                                                                                        <div
                                                                                            className="background-contain background-no-repeat background-position-center ml-1 mt-auto mb-auto"
                                                                                            style={{
                                                                                                backgroundImage: `url(${unescape('https://zluri-assets-new.s3-us-west-1.amazonaws.com/files/assets/logos/5fc4ac5bc70ae4043c76db20.png')})`,
                                                                                                width: "12px",
                                                                                                height: "12px",
                                                                                                marginLeft: "2px",
                                                                                            }}
                                                                                        >
                                                                                        </div>
                                                                                        :
                                                                                        <NameBadge name={threat.scope.source} style={{ marginLeft: "2px" }} width={12} className="rounded-circle" />
                                                                                }
                                                                            </>
                                                                        }
                                                                        {
                                                                            (threat.scope.source && threat.scope.risk) &&
                                                                            <hr
                                                                                className="mt-0 mb-0 ml-2 mr-2"
                                                                                style={{
                                                                                    height: "auto",
                                                                                    borderRight: "0.2px solid #7171714d",
                                                                                }}
                                                                            />
                                                                        }
                                                                        {
                                                                            threat.scope.risk &&
                                                                            <div className="d-flex">
                                                                                <div className="mt-1 grey-1 font-11 o-5 mr-2">{getThreatType(threat.scope.risk)}</div>
                                                                                <Rating rating={threat.scope.risk} iconType="scope" />
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </Accordion.Toggle>
                                                        </Card.Header>
                                                    </Card>
                                                ))
                                            }
                                        </div>
                                        {
                                            showModal &&
                                            <RiskModal
                                                closeModal={() => setShowModal(false)}
                                                isUser={true}
                                                rowDetails={{
                                                    row: {
                                                        _id: props.application?.app_id,
                                                        app_logo: props.application?.app_logo,
                                                        app_name: props.application?.app_name,
                                                        app_status: props.application?.app_status
                                                    }
                                                }}
                                            />
                                        }
                                    </div>
                                    :
                                    <div className="d-flex flex-column" style={{ height: "50vh" }}>
                                        <img src={common_empty} className="mt-auto ml-auto mr-auto" />
                                        <div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
                                            Nothing here
                                        </div>
                                    </div>
                        }
                    </>
            }
        </>
    );
}