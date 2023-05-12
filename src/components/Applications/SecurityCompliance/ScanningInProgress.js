import React from "react";
import emptySearch from "../../../assets/emptySearch.svg";
import { Button } from "../../../UIComponents/Button/Button";
import { Modal } from "../../../UIComponents/Modal/Modal";

function ScanningInProgress(props) {
    return (
        <Modal
            show={props.isOpen}
            onClose={() => {
                props.closeModal();
            }}
            size="md"
        >
            <div
                className={`d-flex flex-column justify-content-center align-items-center ${props.className}`}
                style={{ minHeight: "35vh" }}
            >
                <img src={emptySearch} width={150} className="mt-3" />
                <div className="font-18 bold-600 text-center">
                    Scanning in progress
                </div>
                <div className="font-14 text-center mt-2">
                    Please be back after a few minutes to check the updated data
                </div>
                <Button
                    className="ml-auto mr-auto mt-4"
                    onClick={props.closeModal}
                >
                    Close
                </Button>
            </div>
        </Modal>
    );
}

export default ScanningInProgress;
