import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { NameBadge } from "../../../../common/NameBadge";
import close from "../../../../assets/close.svg";
import { getSourceDetails, markSourcePrimary } from "../../../../services/api/sourcesApi";
import DotsImage from "../../../../assets/icons/horizontal-dots.svg";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import check from "../../../../assets/applications/check.svg";
import lastSynced from "../../../../assets/lastSynced.svg";
import lastActivity from "../../../../assets/lastActivity.svg";
import copyIcon from "../../../../assets/copyIcon.svg";
import moment from "moment";
import {
    AreaChart,
    ResponsiveContainer,
    linearGradient,
    YAxis,
    XAxis,
    Area,
    CartesianGrid,
} from "recharts";
import { kFormatter, urlifyImage, unescape } from "../../../../utils/common";
import ContentLoader from "react-content-loader";
import { DottedRisk, getRiskStatus } from "../../../../common/DottedRisk/DottedRisk";
import { Accordion, Card, Badge, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import caret from '../../../../components/Integrations/caret.svg';
import greenTick from "../../../../components/Integrations/greenTick.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import _ from "underscore";
import RoleContext from "../../../../services/roleContext/roleContext";

function SourceDetails(props) {

    const [sourceDetails, setSourceDetails] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [showMenu, setShowMenu] = useState(false);
    const optionButtonRef = useRef();
    const [errorMarkingSourcePrimary, setErrorMarkingSourcePrimary] = useState();
    const [markingSourcePrimary, setMarkingSourcePrimary] = useState(false);
    const { isViewer } = useContext(RoleContext);

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
            getSourceDetails(
                props.user_app_id,
                props.sourceId === "agent"
                    ? props.identifier
                    : props.sourceId,
                props.sourceId === "agent"
                    ? "agent"
                    : "integration"
            ).then((res) => {
                if (res?.error) {
                    setError(res?.error);
                } else {
                    setSourceDetails(res);
                    setError();
                }
                setLoading(false);
            })
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        requestEndPoint();
    }, []);

    function formatXAxis(tickItem) {
        return moment(new Date(tickItem)).format('MMM DD');
    }

    const optionStyle = {
        fontSize: "14px",
        fontWeight: "400",
        paddingLeft: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
        width: "180px",
        borderRadius: "2px",
    }

    const handleMarkAsPrimary = () => {
        setMarkingSourcePrimary(true);
        try {
            markSourcePrimary(props.user_app_id, props.sourceId).then((resp) => {
                if (resp?.error) {
                    setErrorMarkingSourcePrimary(resp);
                    setMarkingSourcePrimary(false);
                }
                setMarkingSourcePrimary(false);
                props.refresh && props.refresh();
            })
        } catch (error) {
            setErrorMarkingSourcePrimary(error);
            setMarkingSourcePrimary(false);
        }
    }

    return (
        <Fragment>
            <div className="modal-backdrop show"></div>
            <div className="sourceDetailsModal">
                <div className="d-flex flex-column border-bottom-0 py-4 pl-3 pr-3">
                    <div className="d-flex">
                        <div className="mx-auto d-flex align-items-center" style={{ width: "90%" }}>
                            <div className="font-18 bold-600" style={{ width: "29%" }}>Sources for</div>
                            {
                                props?.isUser ?
                                    (
                                        <>
                                            {
                                                props?.user_profile ?
                                                    <div className="ml-1 rounded-circle headerImage" style={{ backgroundImage: `url(${urlifyImage(unescape(props?.user_profile))})` }} ></div>
                                                    : <NameBadge name={props?.user_name} width={26} borderRadius={50} className="ml-2 rounded-circle" />
                                            }
                                            <div className="ml-1 mt-auto mb-auto bold-600 font-18 text-truncate" style={{ maxWidth: "60%" }}>{props?.user_name}</div>
                                        </>
                                    )
                                    :
                                    (
                                        <>
                                            {
                                                props?.app_logo ?
                                                    <div className="ml-1 rounded-circle headerImage" style={{ backgroundImage: `url(${urlifyImage(unescape(props?.app_logo))})` }} ></div>
                                                    : <NameBadge name={props?.app_name} width={26} borderRadius={50} className="ml-2 rounded-circle" />
                                            }
                                            <div className="ml-1 mt-auto mb-auto bold-600 font-18 text-truncate" style={{ maxWidth: "60%" }}>{props?.app_name}</div>
                                        </>
                                    )
                            }
                        </div>
                        <img
                            alt="Close"
                            src={close}
                            className="cursor-pointer mr-3"
                            style={{ width: "11px" }}
                            onClick={() => {
                                props.closeSourceDetails && props.closeSourceDetails()
                            }
                            }
                        />
                    </div>
                    {
                        props.handleViewAll &&
                        <div className="primary-color cursor-pointer font-13 bold-normal pl-2" onClick={() => props.handleViewAll()}>
                            View all
                        </div>
                    }
                </div>
                <div
                    style={{ height: "calc(100vh - 70px)", overflowY: "auto" }}
                    className="position-relative"
                >
                    {
                        (error && !loading) ?
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
                                <div className="lightBlueBackground pl-3 pr-3">
                                    <div className="d-flex flex-row w-100">
                                        {
                                            loading ?
                                                <ContentLoader height={50} width={400}>
                                                    <circle r="20" cx="22" cy="22" fill="#EBEBEB" />
                                                    <rect width="200" x="50" y="8" height="15" rx="2" fill="#EBEBEB" />
                                                    <rect width="100" x="50" y="30" height="10" rx="2" fill="#EBEBEB" />
                                                </ContentLoader>
                                                :
                                                <img src={sourceDetails?.source_logo} className="m-auto" style={{ width: "40px", height: "40px" }} />
                                        }
                                        {
                                            !loading &&
                                            <>
                                                <div className="d-flex flex-column w-100 ml-2">
                                                    <div className="d-flex flex-row">
                                                        <div className="mr-auto font-18 bold-600 ml-1">{sourceDetails?.source_name}</div>
                                                        {
                                                            _.isBoolean(sourceDetails?.is_primary) &&
                                                            <div className="ml-auto bold-600 grey-1 font-11 mt-auto mb-auto">
                                                                {
                                                                    sourceDetails?.is_primary ?
                                                                        <>Primary Source</>
                                                                        :
                                                                        <>Alternate Source</>
                                                                }
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className="d-flex flex-row mt-1">
                                                        <div className="ml-1 grey-1">{sourceDetails?.source_category_name}</div>
                                                        {
                                                            sourceDetails?.source_status &&
                                                            <div className="flex flex-row center ml-auto mt-auto mb-auto">
                                                                {sourceDetails?.source_status === "inactive" ? (
                                                                    <>
                                                                        <img src={inactivecheck}></img>
                                                                        <div className="grey-1 bold-normal font-9 text-right ml-1">
                                                                            Not in Use
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <img src={check} alt="" />
                                                                        <div className="grey-1 bold-normal font-9 text-right ml-1">
                                                                            In use
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="ml-2 d-flex" ref={optionButtonRef} key={markingSourcePrimary}>
                                                    <img src={DotsImage} onClick={() => setShowMenu((val) => !val)} width={15} className="mt-1 mb-auto" />
                                                    {
                                                        showMenu &&
                                                        <Popover
                                                            align="center"
                                                            show={showMenu}
                                                            refs={[optionButtonRef]}
                                                            onClose={() => setShowMenu(false)}
                                                            style={{
                                                                width: "197px",
                                                                transform: "translateX(-85%)",
                                                                left: "unset",
                                                                padding: "4px",
                                                                cursor: "pointer",
                                                                top: "30px"
                                                            }}
                                                        >
                                                            <CopyToClipboard text={sourceDetails?.source_name}>
                                                                <div
                                                                    className="Z__options d-flex flex-column ml-auto mr-auto mt-1 p-2"
                                                                    style={{ ...optionStyle, ...{ 'boxShadow': "inset 0px 0px 4px 0 #c6c6c6" } }}
                                                                >
                                                                    <div className="font-9 o-5">
                                                                        Client Name
                                                                    </div>
                                                                    <div className="grey-1 font-12 mt-1 user-select-none" id="clientName">
                                                                        {sourceDetails?.source_name}
                                                                    </div>
                                                                </div>
                                                            </CopyToClipboard>
                                                            <CopyToClipboard text={sourceDetails?.source_id}>
                                                                <div
                                                                    className="z__options d-flex flex-column ml-auto mr-auto mt-2 pl-2 pr-2 pb-2 pt-1"
                                                                    style={optionStyle}
                                                                >
                                                                    <div className="d-flex flex-row">
                                                                        <div className="font-13">
                                                                            Client ID
                                                                        </div>
                                                                        <img src={copyIcon} className="ml-auto mr-0" style={{ width: "16px" }} />
                                                                    </div>
                                                                    <div className="o-5 font-9 mt-1 user-select-none" id="cliendId">
                                                                        Copy to clipboard
                                                                    </div>
                                                                </div>
                                                            </CopyToClipboard>
                                                            {
                                                                _.isBoolean(sourceDetails?.is_primary) && !sourceDetails?.is_primary && !isViewer &&
                                                                <div
                                                                    className="z__options d-flex flex-row ml-auto mr-auto mt-2 pl-2 pr-2 pb-2 pt-1"
                                                                    style={optionStyle}
                                                                    onClick={() => handleMarkAsPrimary()}
                                                                >
                                                                    <div className="font-13 grey text-truncate">
                                                                        Mark as Primary Source
                                                                    </div>
                                                                    {
                                                                        markingSourcePrimary ?
                                                                            <Spinner
                                                                                animation="border"
                                                                                role="status"
                                                                                size="sm"
                                                                                className="ml-2"
                                                                                style={{ borderWidth: 2 }}
                                                                            >
                                                                            </Spinner>
                                                                            : (errorMarkingSourcePrimary && !markingSourcePrimary) ?
                                                                                <OverlayTrigger
                                                                                    placement="top"
                                                                                    overlay={
                                                                                        <Tooltip>
                                                                                            Unable to mark the source as primary
                                                                                        </Tooltip>
                                                                                    }
                                                                                >
                                                                                    <img src={warning} style={{ width: "15px", height: "15px" }} className="mt-auto mb-auto ml-1" />
                                                                                </OverlayTrigger>
                                                                                : null
                                                                    }
                                                                </div>
                                                            }
                                                        </Popover>
                                                    }
                                                </div>
                                            </>
                                        }
                                    </div>
                                    <div className="d-flex flex-row justify-content-center mt-2">
                                        {
                                            loading ?
                                                <ContentLoader height={15} width={400}>
                                                    <rect width="150" x="0" y="0" height="10" rx="2" fill="#EBEBEB" />
                                                    <rect width="150" x="200" y="0" height="10" rx="2" fill="#EBEBEB" />
                                                </ContentLoader>
                                                :
                                                <>
                                                    <div className="d-flex flex-row">
                                                        <img className="mr-1" src={lastSynced} width={10} />
                                                        <div className="grey-1 font-10 bold-normal">last synced at</div>
                                                        <div className="grey-1 font-10 bold-normal o-5 ml-1">{sourceDetails?.source_last_sync_date ? moment(sourceDetails?.source_last_sync_date).format("DD MMM HH:mm") : 'unavailable'}</div>
                                                    </div>
                                                    <div className="d-flex flex-row ml-3">
                                                        <img className="mr-1" src={lastActivity} width={10} />
                                                        <div className="grey-1 font-10 bold-normal">last activity at</div>
                                                        <div className="grey-1 font-10 bold-normal o-5 ml-1">{sourceDetails?.source_last_activity_date ? moment(sourceDetails?.source_last_activity_date).format("DD MMM HH:mm") : 'unavailable'}</div>
                                                    </div>
                                                </>
                                        }
                                    </div>
                                </div>
                                <div className="border-1" style={{ margin: "18px", borderRadius: "6px" }}>
                                    <div className="d-flex flex-column m-4">
                                        {
                                            loading ?
                                                <ContentLoader height={15} width={400}>
                                                    <rect width="150" x="0" y="0" height="10" rx="2" fill="#EBEBEB" />
                                                </ContentLoader>
                                                :
                                                <>
                                                    <div className="grey font-16 bold-normal">
                                                        Recent Activity Trend
                                                    </div>
                                                    {
                                                        sourceDetails?.source_last_active_hours ?
                                                            <div className="font-10 grey-1 o-5 bold-normal mt-1">Last active {sourceDetails?.source_last_active_hours} hours ago</div>
                                                            : null
                                                    }
                                                </>
                                        }
                                    </div>
                                    {
                                        loading ?
                                            <div className="d-flex justify-content-center pb-3">
                                                <ContentLoader width={400} height={250}>
                                                    <rect x="" y="0" rx="9" ry="9" width="400" height="250" />
                                                </ContentLoader>
                                            </div>
                                            :
                                            sourceDetails?.source_activity_trend && !loading &&
                                            <div style={{ width: "90%", height: 200 }}>
                                                <ResponsiveContainer>
                                                    <AreaChart
                                                        width={70}
                                                        data={sourceDetails?.source_activity_trend}
                                                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#2266E2" stopOpacity={0.2} />
                                                                <stop offset="60%" stopColor="#2266E2" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid horizontal={false} vertical={false} />
                                                        <XAxis
                                                            dataKey="timestamp"
                                                            tickCount={7}
                                                            tickFormatter={formatXAxis}
                                                            tick={{
                                                                fontSize: 10,
                                                                color: "#717171",
                                                            }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            domain={[
                                                                0,
                                                                'auto',
                                                            ]}
                                                        />
                                                        <YAxis
                                                            tickCount={6}
                                                            tick={{
                                                                fontSize: 10,
                                                                color: "#717171",
                                                                marginLeft: 1,
                                                            }}
                                                            tickFormatter={(tick) => kFormatter(tick, 1)}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            interval={0}
                                                            minTickGap={2}
                                                            allowDecimals={true}
                                                        />
                                                        <Area isAnimationActive={true} dot={false} type="monotone" dataKey="count" stroke="#2266E2" fill="url(#colorPv)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                    }
                                </div>
                                {
                                    (sourceDetails?.risk_level && sourceDetails?.authorized_scope_count && !loading) ?
                                        <div className="d-flex flex-column lightBlueBackground p-2" style={{ marginLeft: "18px", marginRight: "18px" }}>
                                            <div className="m-1 p-2 border-bottom mb-3">
                                                <div className="d-flex flex-row">
                                                    {
                                                        loading ?
                                                            <ContentLoader width={91} height={12}>
                                                                <rect width="91" height="12" rx="2" fill="#EBEBEB" />
                                                            </ContentLoader>
                                                            :
                                                            <div className="grey font-16 bold-600">RISK LEVEL</div>
                                                    }
                                                    <div className="ml-auto" style={{ width: "120px" }}>
                                                        <DottedRisk size="large" value={sourceDetails?.risk_level || 0} loading={loading} />
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
                                                                <div className="font-13 grey-1 bold-normal mt-1">{sourceDetails?.authorized_scope_count || 0} factors</div>
                                                                <div className="ml-auto text-capitalize font-13 grey-1 o-5 mt-1">{sourceDetails?.risk_level ? `${getRiskStatus(sourceDetails?.risk_level)} Risk` : 'Risk unavailable'}</div>
                                                            </Fragment>
                                                    }
                                                </div>
                                            </div>
                                            {
                                                sourceDetails?.scopes ?
                                                    Array.isArray(sourceDetails?.scopes) &&
                                                    <Accordion>
                                                        {
                                                            sourceDetails?.scopes.map((scope, index) => (
                                                                <Card style={{ borderBottom: "0.5px solid #EBEBEB", backgroundColor: "#dbe9f31a" }} className="border-left-0 border-top-0 border-right-0 ml-3 mr-3 mb-3 pb-3" key={index}>
                                                                    <Card.Header
                                                                        style={{ backgroundColor: "#3f5f7a00" }}
                                                                        className="border-0 pt-3 pl-0 pr-0"
                                                                    >
                                                                        <Accordion.Toggle
                                                                            style={{ color: "#484848", fontSize: "13px", border: "0", padding: "16px 12px", backgroundColor: "#bee4ff1a" }}
                                                                            as={Card.Header}
                                                                            className={`d-flex p-0 ${scope.description ? 'cursor-pointer' : ''}`}
                                                                            variant="link"
                                                                            eventKey={scope._id}
                                                                        >
                                                                            <div className="d-flex flex-row w-100" style={{ backgroundColor: "#f8fcff40" }}>
                                                                                <img className="mr-2 mt-2 mb-auto" src={greenTick}></img>
                                                                                <div className="d-flex flex-column">
                                                                                    <div className="d-flex flex-row">
                                                                                        {scope.title}
                                                                                        <div className="mr-auto mt-auto mb-auto ml-2">
                                                                                            <Badge className="ml-1 mr-1 textColor text-uppercase" style={badge} pill variant="light">{scope.read_only ? "read only" : "write"}</Badge>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex flex-row mt-2">
                                                                                        <div className="text-uppercase grey-1 o-5 bold-600 font-11 mr-2">Risk level</div>
                                                                                        <DottedRisk size="sm" value={scope.risk || 0} />
                                                                                        <div className="font-11 grey-1 o-5 bold-normal ml-2 text-capitalize">{getRiskStatus(scope.risk || 0)}</div>
                                                                                    </div>
                                                                                </div>
                                                                                {
                                                                                    scope.description &&
                                                                                    <img className="ml-1 mt-2 mb-auto ml-auto" src={caret}></img>
                                                                                }
                                                                            </div>
                                                                        </Accordion.Toggle>
                                                                    </Card.Header>
                                                                    {
                                                                        scope.description &&
                                                                        <Accordion.Collapse eventKey={scope._id} style={{ backgroundColor: "#5abbff1a" }}>
                                                                            <Card.Body className="textColor pt-2 grey-1 bold-normal" style={{ backgroundColor: "#ffffff6b" }}>{scope.description}</Card.Body>
                                                                        </Accordion.Collapse>
                                                                    }
                                                                </Card>
                                                            ))
                                                        }
                                                    </Accordion>
                                                    : null
                                            }
                                        </div>
                                        : null
                                }
                            </>
                    }
                </div>
            </div>
        </Fragment >
    );
}

export default SourceDetails;