import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import { Button } from "../../../../UIComponents/Button/Button";
import blueCircleEnvelope from "../../../../assets/blueCircleEnvelope.svg";
import upDownArrow from "../../../../assets/upDownArrow.svg";
import edit from "../../../../assets/icons/edit.svg";
import {
    Accordion,
    Card,
    OverlayTrigger,
    Spinner,
    Tooltip,
} from "react-bootstrap";
import { editInviteAccountDetails, reSendInvite, withdrawInvite } from "../../service/api";
import warning from "../../../../assets/warning.svg";
import { refreshIntegrations, resetIntegration } from "../../redux/integrations";
import greenTicket from "../../../../components/Integrations/greenTick.svg";
import { useDispatch } from "react-redux";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import exchange from "../../../../assets/icons/exchangeArrow.svg";
import zluri from "../../../../assets/zluri-logo.svg";
import AccountForm from "../AccountForm/AccountForm";
import { TriggerIssue } from "../../../../utils/sentry";
import { urlifyImage } from "../../../../utils/common";
import { NameBadge } from "../../../../common/NameBadge";

export default function InvitedAccount(props) {
    const [activeInviteAccordion, setActiveInviteAccordion] = useState({});
    const [failedToWithdraw, setFailedToWithdraw] = useState(false);
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const [failedToResendInvite, setFailedToResendInvite] = useState(false);
    const [loadingResendInvite, setLoadingResendInvite] = useState(false);
    const [reSentInvite, setReSentInvite] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const imageSize = {
        width: "30px"
    };
    const dispatch = useDispatch();
    const [isAccountSaving, setIsAccountSaving] = useState(false);
    const [failedToSaveAccountMsg, setFailedToSaveAccountMsg] = useState();

    useEffect(() => {
        if (!showAccountModal) {
            setFailedToSaveAccountMsg();
            setIsAccountSaving(false);
        }
    }, [showAccountModal]);

    const editAccount = (inviteObject) => {
        if (inviteObject.accountName != props.invitedAccount.account_name || inviteObject.accountDescription != props.invitedAccount.account_description) {
            setIsAccountSaving(true);
            try {
                editInviteAccountDetails(
                    props.invitedAccount.invite_id,
                    inviteObject)
                    .then((res) => {
                        if (res?.success) {
                            setFailedToSaveAccountMsg();
                            dispatch(resetIntegration());
                        } else {
                            setFailedToSaveAccountMsg(res?.error?.response?.data?.error || "some issue");
                        }
                        setIsAccountSaving(false);
                    })
            } catch (error) {
                setIsAccountSaving(false);
                setFailedToSaveAccountMsg("some issue");
                TriggerIssue("Error when editing invite integration details", error);
            }
        } else {
            setShowAccountModal(false);
        }
    }

    const initiateRendInvite = () => {
        if (!reSentInvite && !loadingResendInvite) {
            setLoadingResendInvite(true);
            try {
                reSendInvite(
                    props.invitedAccount.invite_id
                ).then((res) => {
                    if (res && res?.statusCode === 202) {
                        setFailedToResendInvite(false);
                        setReSentInvite(true);
                        setTimeout(() => {
                            setReSentInvite(false);
                        }, [3000]);
                    } else {
                        setFailedToResendInvite(true);
                    }
                    setLoadingResendInvite(false);
                })
            } catch (error) {
                setLoadingResendInvite(false);
                setFailedToResendInvite(true);
                TriggerIssue("ERROR in reSending the invite", error);
            }
        }
    }

    const withdrawClickHandler = () => {
        setLoadingWithdraw(true);
        try {
            withdrawInvite(
                props.invitedAccount.integration_id,
                props.invitedAccount.invite_id
            ).then((res) => {
                if (res.is_withdrawn) {
                    dispatch(refreshIntegrations());
                    setFailedToWithdraw(false);
                    dispatch(resetIntegration());
                } else {
                    setFailedToWithdraw(true);
                }
                setLoadingWithdraw(false);
            });
        } catch (error) {
            setLoadingWithdraw(false);
            setFailedToWithdraw(true);
            TriggerIssue("ERROR in withdrawing the invite", error);
        }
    };

    return (
        <Fragment>
            <Accordion>
                <Card
                    className="border-left-0 border-top-0 border-right-0"
                    key={props.uniqueKey + "invites"}
                >
                    <Card.Header
                        style={{ padding: "0" }}
                        className="bg-white border-0"
                    >
                        <div className="row w-100 m-0 pt-2 pb-2">
                            <div className="col-md-1 p-0 justify-content-center d-flex">
                                <img
                                    src={blueCircleEnvelope}
                                    className="mb-auto ml-auto mr-auto"
                                />
                            </div>
                            <div className="d-flex flex-column col p-0">
                                <div className="d-flex flex-row p-0 onHoverShowChild">
                                    {props.invitedAccount.account_description ? (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip>
                                                    {
                                                        props.invitedAccount.account_description
                                                    }
                                                </Tooltip>
                                            }
                                        >
                                            <div className={`font-14 mr-1 mt-auto mb-auto text-truncate ${props.invitedAccount.account_name ? "bold-normal" : "grey-1 o-6 dashedBorder border-right-0 border-left-0 border-top-0"}`} style={{ minWidth: "100px" }}>
                                                {props.invitedAccount.account_name || 'NA'}
                                            </div>
                                        </OverlayTrigger>
                                    ) : (
                                        <div className={`font-14 mr-1 mt-auto mb-auto text-truncate ${props.invitedAccount.account_name ? "bold-normal" : "grey-1 o-6 dashedBorder border-right-0 border-left-0 border-top-0"}`} style={{ minWidth: "100px" }}>
                                            {props.invitedAccount.account_name || 'NA'}
                                        </div>
                                    )}
                                    <Accordion.Toggle
                                        className="bg-white d-flex cursor-pointer border-0 p-0"
                                        variant="link"
                                        eventKey={props.uniqueKey + "invites"}
                                        onClick={() =>
                                            setActiveInviteAccordion({
                                                [props.uniqueKey + "invites"]:
                                                    !activeInviteAccordion[
                                                    props.uniqueKey + "invites"
                                                    ],
                                            })
                                        }
                                    >
                                        <img
                                            src={upDownArrow}
                                            className="mr-auto mt-auto mb-auto"
                                        />
                                    </Accordion.Toggle>
                                    <img
                                        src={edit}
                                        className="ml-auto childElement cursor-pointer"
                                        style={{ width: "12.8px" }}
                                        onClick={() => setShowAccountModal(true)}
                                    />
                                </div>
                                <div className="font-11 grey-1 mt-1">
                                    Connection Request Sent{" "}
                                    {activeInviteAccordion[
                                        props.uniqueKey + "invites"
                                    ]
                                        ? `on ${moment(
                                            props.invitedAccount.request_sent_on
                                        ).format("MMM Do H:mm")} to ${props.invitedAccount.sent_to_user_email
                                        }`
                                        : ""}
                                </div>
                            </div>
                        </div>
                    </Card.Header>
                    <Accordion.Collapse eventKey={props.uniqueKey + "invites"}>
                        <Card.Body className="d-flex flex-row pt-1">
                            {
                                <div className="d-flex flex-row">
                                    <Button className="mr-2 bg-light primary-color font-12 d-flex" onClick={initiateRendInvite}>
                                        {
                                            loadingResendInvite ? (
                                                <Spinner
                                                    animation="border"
                                                    role="status"
                                                    variant="primary"
                                                    size="sm"
                                                    className="mr-1"
                                                    style={{
                                                        borderWidth: 2,
                                                        width: "13px",
                                                        height: "13px",
                                                    }}
                                                >
                                                    <span className="sr-only">
                                                        Loading...
                                                    </span>
                                                </Spinner>
                                            ) : failedToResendInvite ? (
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            Failed to resend invite
                                                        </Tooltip>
                                                    }
                                                >
                                                    <img
                                                        style={{ width: "13px" }}
                                                        className="mt-0 mr-1"
                                                        src={warning}
                                                    />
                                                </OverlayTrigger>
                                            ) : reSentInvite ?
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            Successfuly sent invite
                                                        </Tooltip>
                                                    }
                                                >
                                                    <img
                                                        style={{ width: "13px", marginTop: "2px" }}
                                                        className="mr-1"
                                                        src={greenTicket}
                                                    />
                                                </OverlayTrigger>
                                                : null}
                                        Send Reminder
                                    </Button>
                                    <Button
                                        className="bg-light grey font-12 d-flex"
                                        onClick={withdrawClickHandler}>
                                        {
                                            loadingWithdraw ? (
                                                <Spinner
                                                    animation="border"
                                                    role="status"
                                                    variant="primary"
                                                    size="sm"
                                                    className="mr-1"
                                                    style={{
                                                        borderWidth: 2,
                                                        width: "13px",
                                                        height: "13px",
                                                    }}
                                                >
                                                    <span className="sr-only">
                                                        Loading...
                                                    </span>
                                                </Spinner>
                                            ) : failedToWithdraw ? (
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip>
                                                            Failed to withdraw
                                                            invite
                                                        </Tooltip>
                                                    }
                                                >
                                                    <img
                                                        style={{ width: "13px" }}
                                                        className="mt-0 mr-1"
                                                        src={warning}
                                                    />
                                                </OverlayTrigger>
                                            ) : null}
                                        Withdraw
                                    </Button>
                                </div>
                            }
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
            {
                showAccountModal &&
                <Modal
                    dialogClassName="z_i_connect_modal_dialog"
                    show={showAccountModal}
                    onClose={() => setShowAccountModal(false)}
                >
                    <div className="mt-5 mb-5 d-flex flex-column ml-auto mr-auto" style={{ width: "410px" }}>
                        <div className="m-auto">
                            <img className="ml-auto" style={imageSize} src={zluri}></img>
                            <img className="ml-2 mr-2" src={exchange}></img>
                            {
                                props.integrationLogo ?
                                    <img
                                        className="mr-auto"
                                        style={imageSize}
                                        src={urlifyImage(unescape(props.integrationLogo))}
                                    />
                                    :
                                    <NameBadge
                                        name={props.integrationName}
                                        className="mr-auto"
                                        style={imageSize}
                                    />
                            }
                        </div>
                        <div className="font-18 text-center mb-4 mt-2">
                            Edit Connection
                        </div>
                        <AccountForm
                            accountName={props.invitedAccount.account_name}
                            accountDescription={props.invitedAccount.account_description}
                            isFailedMsg={failedToSaveAccountMsg}
                            isLoading={isAccountSaving}
                            onSave={editAccount}
                        />
                    </div>
                </Modal>
            }
        </Fragment>
    );
}
