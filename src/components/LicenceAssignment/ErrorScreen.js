import React, { Fragment } from "react";
import { Button } from "../../UIComponents/Button/Button";
import { Modal } from "../../UIComponents/Modal/Modal";
import warning from "../Onboarding/warning.svg";
import { Spinner } from "react-bootstrap";
import CheckCircleSVG from "../../assets/icons/check-circle.svg";

function ErrorScreen(props) {
    return (
        <Fragment>
            {
                props.isOpen &&
                <div className="modal-backdrop show"></div>
            }
            <Modal
                show={props.isOpen}
                onClose={() => {
                    props.closeModal();
                }}
                size="md"
                footer={false}
            >
                <div className="d-flex flex-column p-4" style={{ height: "300px" }}>
                    <img
                        src={!props.isSuccess ? warning : CheckCircleSVG}
                        style={{ width: "45px" }}
                        className="mt-auto ml-auto mr-auto mb-3"
                    />
                    {props.isSuccess ? (
                        <div className="bold-600 font-18 ml-auto mr-auto mb-4 text-center">
                            {props.successMsgHeading}
                        </div>
                    ) : (
                        <div className="bold-600 font-18 ml-auto mr-auto mb-1 text-center">
                            {props.warningMsgHeading}
                        </div>
                    )}
                    {!props.isSuccess && props.warningMsgDescription && (
                        <div className="font-14 bold-normal ml-auto mb-3 mr-auto text-center">
                            {props.warningMsgDescription}
                        </div>
                    )}
                    {props.isSuccess ? (
                        <Button
                            className="mb-auto ml-auto mr-auto"
                            onClick={() => props.closeModal && props.closeModal()}
                        >
                            Close
                        </Button>
                    ) : (
                        <Button
                            onClick={(e) =>
                                props.retryFunction && props.retryFunction(e)
                            }
                            size="sm"
                            className="mb-auto ml-auto mr-auto"
                            disabled={props.loading}
                        >
                            Retry
                            {props.loading && (
                                <Spinner
                                    animation="border"
                                    role="status"
                                    variant="light"
                                    size="sm"
                                    className="ml-2"
                                    style={{ borderWidth: 2 }}
                                >
                                    <span className="sr-only">Loading...</span>
                                </Spinner>
                            )}
                        </Button>
                    )}
                </div>
            </Modal>
        </Fragment>
    );
}

export default ErrorScreen;
