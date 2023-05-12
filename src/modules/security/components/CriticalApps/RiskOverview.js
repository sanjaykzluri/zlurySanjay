import React, { useContext, useEffect, useState, Fragment } from "react";
import { DottedRisk, getRiskStatus } from "../../../../common/DottedRisk/DottedRisk";
import { getCriticalAppsOverview } from "../../../../services/api/security";
import { Accordion, Card, Badge, Dropdown, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import check from '../../../../components/Integrations/greenTick.svg';
import caret from '../../../../components/Integrations/caret.svg';
import ContentLoader from "react-content-loader";
import _ from "underscore";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg"
import warning from "../../../../components/Onboarding/warning.svg";
import active from "../../../../assets/applications/check.svg";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import Rating from "../../../../components/Applications/SecurityCompliance/Rating";
import { getApplicationSecurityOverview, updateManualRisk } from "../../../../services/api/applications";
import { unescape, urlifyImage } from "../../../../utils/common";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationCompliance, fetchApplicationEvents } from "../../../../actions/applications-action";
import moment from "moment";
import ShowMoreText from "react-show-more-text";
import common_empty from "../../../../assets/common/common_empty.png";
import lowRisk from "../../../../assets/low_risk.svg";
import mediumRisk from "../../../../assets/medium_risk.svg";
import highRisk from "../../../../assets/high_risk.svg";
import dropdownarrow from "../../../../components/Applications/Overview/dropdownarrow.svg";
import needsreview from "../../../../assets/applications/needsreview.svg";
import { NameBadge } from "../../../../common/NameBadge";
import OverviewField from "../../../../components/Applications/SecurityCompliance/OverviewField.js";
import RiskIcon from "../../../..//components/Applications/SecurityCompliance/RiskIcon";
import { useHistory } from "react-router";
import Grade from "../../../../components/Applications/SecurityCompliance/Grade";

function RiskOverview(props) {
    const [usageActivityRisk, setUsageActivityRisk] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const complianceDetails = useSelector((state) => state.applications.singleappSecurityCompliance[props.id]);
    const [compliances, setCompliances] = useState();
    const [loadingCompliance, setLoadingCompliance] = useState(false);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const eventsDetails = useSelector((state) => state.applications.singleappSecurityEvents[props.id]);
    const [securityGrade, setSecurityGrade] = useState();
    const dispatch = useDispatch();
    const history = useHistory();
    const securityProbeData = useSelector((state) => state.applications?.singleappSecurityProbes?.[props.id]?.data);
    const [riskLevel, setRiskLevel] = useState(null);
    const [threat, setThreat] = useState(null);
    const auth_status_dropdown = React.forwardRef(({ children, onClick }, ref) => (
        <a
            className="security__dropdown"
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
        </a>
    ));
    const dropDownOptions = {
        LOW_RISK: {
            title: "Low Risk",
            icon: lowRisk,
            scoreRange: [1, 2],
            apiValue: 1,
            background: "#40E3951A",
        },
        MEDIUM_RISK: {
            title: "Medium Risk",
            icon: mediumRisk,
            scoreRange: [3],
            apiValue: 3,
            background: "#FFC1171A",
        },
        HIGH_RISK: {
            title: "High Risk",
            icon: highRisk,
            scoreRange: [4, 5],
            apiValue: 5,
            background: "#FF67671A",
        }
    };

    const getRiskByValue = (value) => {
        if ([1, 2].includes(value)) {
            return dropDownOptions.LOW_RISK;
        } else if ([3].includes(value)) {
            return dropDownOptions.MEDIUM_RISK;
        } else if ([4, 5].includes(value)) {
            return dropDownOptions.HIGH_RISK;
        }
    }

    const [selectedState, setSelectedState] = useState();

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
        if (complianceDetails) {
            setLoadingCompliance(complianceDetails.loading);
            setCompliances(complianceDetails?.data?.compliances);
        }
    }, [complianceDetails]);

    useEffect(() => {
        if (eventsDetails) {
            if (eventsDetails?.data?.older || eventsDetails?.data?.recent) {
                setEvents([...eventsDetails?.data?.older, ...eventsDetails?.data?.recent]);
            }
            setLoadingEvents(eventsDetails.loading);
        }
    }, [eventsDetails]);

    const requestEndPoint = () => {
        setLoading(true);
        try {
            getCriticalAppsOverview(props.id).then((res) => {
                if (res?.error) {
                    setError(res);
                    setLoading(false);
                } else {
                    setUsageActivityRisk(res?.data);
                    props.setScopeData(res?.data);
                    setError();
                    getApplicationSecurityOverview(props.id).then((res) => {
                        if (res?.error) {
                            setLoading(false);
                        } else {
                            setSelectedState(getRiskByValue(res?.manual_risk_level ? res?.manual_risk_level : res?.risk_level));
                            setRiskLevel(res?.risk_level);
                            setThreat(res?.threat);
                            setSecurityGrade(res);
                            setLoading(false);
                        }
                    })
                }
            });
            dispatch(fetchApplicationCompliance(props.id));
            dispatch(fetchApplicationEvents(props.id));
        } catch (error) {
            setError(error);
            setLoading(false);
            console.log("Error when fetching risk", error);
        }
    }

    useEffect(() => {
        if (props.currentSection === props.sections.overview) {
            requestEndPoint();
        } else {
            setUsageActivityRisk();
            setError();
            setLoading(true);
        }
    }, [props.currentSection]);


    const handleRiskLevelChange = (option) => {
        if (option?.title) {
            setSelectedState(option);
        }
        updateManualRisk(props.id, option?.apiValue)
            .then(() => requestEndPoint());
    }

    const getHttpObservatoryStartTime = () => {
        var HttpObservatoryProbeObj = Array.isArray(securityProbeData?.security_probes) && securityProbeData?.security_probes.find((probe) => probe.k === "http_observatory" || probe.k === "http_obervatory");
        return HttpObservatoryProbeObj?.v?.summary?.start_time;
    }

    return (
        <div className="position-relative" style={{ height: "calc(100vh - 112px)", overflowY: "auto" }} >
            {
                error ?
                    <div className="d-flex flex-column justify-content-center" style={{ height: "100%" }}>
                        <img src={warning} style={{ width: "45px" }} className="ml-auto mr-auto" />
                        <div className="grey-1 font-18 bold-normal w-75 text-center ml-auto mr-auto mt-2">
                            An error occured. Please try again
                        </div>

                        <div className="ml-auto mr-auto mt-2">
                            <Button className="primary-color-border d-flex" type="link" onClick={() => requestEndPoint()}>
                                <img src={refershBlue} className="mr-2" style={{ width: "15px" }} />
                                Retry
                            </Button>
                        </div>
                    </div>
                    :
                    <>
                        <div className="lightBlueBackground row m-auto">
                            <div className="col-md-2 d-flex flex-column justify-content-left">
                                <div className="font-12 grey mb-1">
                                    {loading ? (
                                        <ContentLoader width={91} height={10}>
                                            <rect
                                                width="91"
                                                height="10"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) : (
                                        "Status"
                                    )}
                                </div>
                                <div className="d-flex mt-2">
                                    {loading ? (
                                        <ContentLoader width={105} height={15}>
                                            <rect
                                                width="105"
                                                height="15"
                                                y="06"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) : props.securityOverview?.app_status === "active" ? (
                                        <Fragment>
                                            <img
                                                src={active}
                                                className="mt-auto mb-auto mr-1"
                                                alt="active"
                                            ></img>
                                            Active
                                        </Fragment>
                                    ) : (
                                        <Fragment>
                                            <img
                                                src={inactivecheck}
                                                className="mt-auto mb-auto mr-1"
                                                alt="inactive"
                                            ></img>
                                            Inactive
                                        </Fragment>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4 d-flex flex-column justify-content-left">
                                <div className="font-12 grey mb-1">
                                    {loading ? (
                                        <ContentLoader width={91} height={10}>
                                            <rect
                                                width="91"
                                                height="10"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) : (
                                        "Risk"
                                    )}
                                </div>
                                <div className="d-flex">
                                    {loading ? (
                                        <ContentLoader width={105} height={15}>
                                            <rect
                                                width="105"
                                                height="15"
                                                y="06"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) : (
                                        <Dropdown
                                            className="security__dropdown__wrapper"
                                            style={{
                                                backgroundColor: selectedState?.background
                                            }}
                                        >
                                            <Dropdown.Toggle as={auth_status_dropdown}>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <BootstrapTooltip>
                                                            {selectedState ? 'This risk is manually set by admin' : <span className="o-5 font-11">NO DATA AVAILABLE</span>}
                                                        </BootstrapTooltip>
                                                    }
                                                >
                                                    <div className="d-flex dropdown_button w-100 cursor-pointer">
                                                        <img src={selectedState?.icon || needsreview} width={11} />
                                                        <div className="font-14 grey ml-2 mr-0 grey bold-normal text-capitalize w-100 d-flex">
                                                            {selectedState?.title || <span className="o-5 font-11">Data unavailable</span>}
                                                            <img
                                                                className="ml-auto"
                                                                width={8}
                                                                src={
                                                                    dropdownarrow
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </OverlayTrigger>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="p-0 security__dropdown__menu">
                                                {Object.values(dropDownOptions).map((option) => (
                                                    <Dropdown.Item
                                                        onClick={() => handleRiskLevelChange(option)}
                                                    >
                                                        <div className="d-flex flex-row align-items-center">
                                                            <img src={option.icon} />
                                                            <div className="overview__dropdownbutton__d2">
                                                                {option.title}
                                                            </div>
                                                        </div>
                                                    </Dropdown.Item>
                                                ))}
                                                <Dropdown.Divider className="mt-0 mb-0" />
                                                <Dropdown.Item
                                                    onClick={() => handleRiskLevelChange({ value: null })}
                                                >Reset Risk</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-3 d-flex flex-column justify-content-left">
                                <div className="font-12 grey mb-1">
                                    {loading ? (
                                        <ContentLoader width={91} height={10}>
                                            <rect
                                                width="91"
                                                height="10"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) : (
                                        "Threat"
                                    )}
                                </div>
                                <div className="d-flex mt-2">
                                    {loading ? (
                                        <ContentLoader width={105} height={15}>
                                            <rect
                                                width="105"
                                                height="15"
                                                y="06"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) :
                                        <div className="d-flex flex-row">
                                            <Rating rating={props.securityOverview.app_max_risk || threat || 0} iconType="scope" width={12} height={15} showValueInsideIcon={true} />
                                            <div className="font-14 ml-3">
                                                {`Level ${props.securityOverview.app_max_risk || threat || 0}`}
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="col-md-3 d-flex flex-column justify-content-left">
                                <div className="font-12 grey mb-1">
                                    {loading ? (
                                        <ContentLoader width={91} height={10}>
                                            <rect
                                                width="91"
                                                height="10"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) : (
                                        "Risk Level"
                                    )}
                                </div>
                                <div className="d-flex mt-1">
                                    {loading ? (
                                        <ContentLoader width={105} height={15}>
                                            <rect
                                                width="105"
                                                height="15"
                                                y="06"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    ) :
                                        <div className="d-flex flex-row align-items-center">
                                            <Rating
                                                rating={Math.ceil(props.securityOverview?.app_risk_level || riskLevel || 0)}
                                                iconType="risk"
                                                singleIcon={true}
                                                width={12}
                                                height={12}
                                            />
                                            <div className="font-13 pl-1" style={{ paddingTop: "1px" }}>
                                                {`Level ${props.securityOverview?.app_risk_level || riskLevel || 0}`}
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="m-4">
                            <div className="font-16 bold-600 grey">
                                Compliance
                            </div>
                            <div className="mt-2 d-flex flex-wrap">
                                {
                                    loadingCompliance ? (
                                        _.times(3, () => (
                                            <ContentLoader width={60} height={60}>
                                                <circle cx="25" cy="25" r="25" fill="#EBEBEB" />
                                            </ContentLoader>
                                        ))
                                    ) : (
                                        (compliances && Array.isArray(compliances) && compliances.length > 0) ?
                                            compliances?.map((compliance, index) => (
                                                <div
                                                    key={index}
                                                    className="background-contain background-no-repeat background-position-center mr-2 ml-2 mt-1"
                                                    style={{
                                                        backgroundImage: `url(${urlifyImage(unescape(compliance.compliance_image))})`,
                                                        width: "54px",
                                                        height: "54px"
                                                    }}
                                                >
                                                </div>
                                            ))
                                            :
                                            <div className="d-flex flex-column p-3 bg-white mb-3 rounded ml-auto mr-auto" style={{ height: "100px" }}>
                                                <img src={common_empty} className="mt-auto ml-auto mr-auto" />
                                                <div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
                                                    No compliances :)
                                                </div>
                                            </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="d-flex flex-column border bg-white m-3 rounded">
                            <div className="font-16 bold-600 grey bg-light p-3 rounded">
                                Events
                            </div>
                            {
                                loadingEvents ? (
                                    <div className="p-3">
                                        <ContentLoader width={"100%"} height={100}>
                                            <rect
                                                width="100%"
                                                height="100"
                                                y="0"
                                                rx="2"
                                                fill="#EBEBEB"
                                            />
                                        </ContentLoader>
                                    </div>
                                ) : (
                                    (events && Array.isArray(events) && events.length > 0) ?
                                        (
                                            <div className="pt-3 pr-3 pl-3">
                                                {
                                                    events?.map((event, index) => (
                                                        <div className="d-flex flex-column mt-3" key={index}>
                                                            <div className="o-5 font-11 grey-1">
                                                                {
                                                                    event.event_date ?
                                                                        moment(event.event_date).format("DD MMMM YYYY")
                                                                        : "unavailable"
                                                                }
                                                            </div>
                                                            <div className="font-14 bold-600 mt-2 grey">
                                                                {event.title}
                                                            </div>
                                                            {event.description && (
                                                                <div className="font-13 grey-1 mt-1">
                                                                    <ShowMoreText
                                                                        lines={2}
                                                                        more="Read more"
                                                                        less="View less"
                                                                        expanded={false}
                                                                    >
                                                                        {event.description}
                                                                    </ShowMoreText>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                }
                                                <div className="ml-0 mr-0 mt-3 border border-left-0 border-right-0 border-bottom-0 d-flex">
                                                    <Button type="link" className="m-auto" onClick={() => history.push(`/applications/${props.id}/#security`)}>
                                                        View more
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                        : (
                                            <div className="d-flex flex-column p-3 mb-1 rounded mt-3">
                                                <img src={common_empty} className="mt-auto ml-auto mr-auto" />
                                                <div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
                                                    No events :)
                                                </div>
                                            </div>
                                        )
                                )
                            }
                        </div>
                        <div className="border m-3 rounded">
                            <div className="p-3 bg-light rounded">
                                <div className="d-flex flex-row">
                                    {
                                        loading ?
                                            <ContentLoader width={91} height={12}>
                                                <rect width="91" height="12" rx="2" fill="#EBEBEB" />
                                            </ContentLoader>
                                            :
                                            <div className="grey font-16 bold-600">THREAT</div>
                                    }
                                    <div className="ml-auto">
                                        <Rating rating={usageActivityRisk?.max_risk || 0} iconType="scope" width="13.8" height="15.36" />
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
                                                <div className="font-13 grey-1 bold-normal mt-1">{usageActivityRisk?.total_compromising_scopes || 0} factors compromising security</div>
                                                <div className="ml-auto text-capitalize font-13 grey-1 o-5 mt-1">{usageActivityRisk?.max_risk ? `Level ${usageActivityRisk?.max_risk}` : ''}</div>
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
                                    <>
                                        {
                                            usageActivityRisk?.scopes_array && Array.isArray(usageActivityRisk?.scopes_array) && (usageActivityRisk?.scopes_array.length > 0) && (
                                                <>
                                                    <Accordion className="pt-1 pl-3 pr-3 pb-1">
                                                        {
                                                            usageActivityRisk?.scopes_array.map((source, index) => (
                                                                <Card
                                                                    style={{
                                                                        borderBottom:
                                                                            "0.5px solid #EBEBEB",
                                                                    }}
                                                                    className={
                                                                        index ===
                                                                            usageActivityRisk
                                                                                ?.scopes_array
                                                                                ?.length -
                                                                            1
                                                                            ? "border-0"
                                                                            : "border-left-0 border-top-0 border-right-0"
                                                                    }
                                                                    key={index}
                                                                >
                                                                    <Card.Header
                                                                        style={{
                                                                            padding: "0",
                                                                            position:
                                                                                "relative",
                                                                        }}
                                                                        className="bg-white border-0"
                                                                    >
                                                                        <Accordion.Toggle
                                                                            style={{
                                                                                padding:
                                                                                    "16px 0px",
                                                                            }}
                                                                            as={Card.Header}
                                                                            className="bg-white d-flex border-0 font-13 cursor-pointer grey"
                                                                            variant="link"
                                                                            eventKey={source._id}
                                                                        >
                                                                            <div className="d-flex flex-row w-100">
                                                                                <img className="mr-2 mt-2 mb-auto" src={check}></img>
                                                                                <div className="d-flex flex-column w-100">
                                                                                    <div className="d-flex flex-row">
                                                                                        <div className="font-13 grey text-wrap">
                                                                                            {source.title}
                                                                                        </div>
                                                                                        <Badge className="mb-auto ml-2 textColor text-uppercase" style={badge} pill variant="light">{source.read_only ? "read only" : "write"}</Badge>
                                                                                        <div
                                                                                            className="cursor-pointer primary-color ml-auto mb-auto font-12 mr-0 text-right"
                                                                                            style={{
                                                                                                width: 75,
                                                                                                marginTop: '3px'
                                                                                            }}
                                                                                            onClick={() => props.changeActiveSectionToCriticalUsers(source.scope)}
                                                                                        >
                                                                                            {source.user_count ? `Show ${source.user_count} Users` : "Show Users"}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex flex-row mt-2">
                                                                                        {
                                                                                            source.source &&
                                                                                            <>
                                                                                                <div className="grey-1 font-11 mt-1 o-5">
                                                                                                    via
                                                                                                </div>
                                                                                                {
                                                                                                    source.source === "gsuite" ?
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
                                                                                                        <NameBadge name={source.source} style={{ marginLeft: "2px" }} width={12} className="rounded-circle" />
                                                                                                }
                                                                                            </>
                                                                                        }
                                                                                        {
                                                                                            (source.source && source.risk) &&
                                                                                            <hr
                                                                                                className="mt-0 mb-0 ml-2 mr-2"
                                                                                                style={{
                                                                                                    height: "auto",
                                                                                                    borderRight: "0.2px solid #7171714d",
                                                                                                }}
                                                                                            />
                                                                                        }
                                                                                        {
                                                                                            source.risk &&
                                                                                            <div className="d-flex">
                                                                                                <div className="mt-1 mr-1 grey-1 font-11 o-5 text-capitalize">{getRiskStatus(source.risk)} Threat</div>
                                                                                                <Rating rating={source.risk} iconType="scope" />
                                                                                            </div>
                                                                                        }
                                                                                        {/* <div className="text-uppercase grey-1 o-5 bold-600 font-11 mr-2">Risk level</div>
                                                                                <DottedRisk size="sm" value={source.risk || 0} />
                                                                                <div className="font-11 grey-1 o-5 bold-normal ml-2 text-capitalize">{getRiskStatus(source.risk || 0)} Threat</div> */}

                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </Accordion.Toggle>
                                                                    </Card.Header>
                                                                </Card>
                                                            ))
                                                        }
                                                    </Accordion>
                                                    <div className="ml-2 mr-2 mt-1 border border-left-0 border-right-0 border-bottom-0 d-flex">
                                                        <Button type="link" className="m-auto" onClick={() => history.push(`/applications/${props.id}/#security`)}>
                                                            View more
                                                        </Button>
                                                    </div>
                                                </>
                                            )
                                        }
                                    </>
                            }
                        </div>
                        {
                            !loading &&
                            <div className="border m-3 rounded">
                                <div className="font-16 bold-600 grey bg-light p-3 rounded">
                                    Security Grade
                                </div>
                                <div className="d-flex ml-3 mr-3 mb-3">
                                    <Grade value={_.isString(securityGrade?.security_grade) && (securityGrade?.security_grade.toUpperCase() === "X" ? "?" : (securityGrade?.security_grade || "")) || ""} />
                                    <div className="security_fields">
                                        <OverviewField
                                            label="SCORE"
                                            value={
                                                <div>
                                                    {Math.ceil(Number(securityGrade?.score || 0))} on{" "}
                                                    {securityGrade?.score_total}
                                                </div>
                                            }
                                        />
                                        <OverviewField
                                            label="SCANNED ON"
                                            value={<div>{securityGrade.scan_end_time ? moment(securityGrade.scan_end_time).format("Do MMM YYYY") : moment(getHttpObservatoryStartTime()).format("Do MMM YYYY")}</div>}
                                            dataUnavailable={!securityGrade.scan_end_time && !getHttpObservatoryStartTime()}
                                        />
                                    </div>
                                </div>
                                <div className="ml-2 mr-2 mt-3 border border-left-0 border-right-0 border-bottom-0 d-flex">
                                    <Button type="link" className="m-auto" onClick={() => history.push(`/applications/${props.id}/#security`)}>
                                        View more
                                    </Button>
                                </div>
                            </div>
                        }
                    </>
            }
        </div >
    );
}

export default RiskOverview;