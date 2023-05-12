import React, { useContext, useState, Fragment } from "react";
import empty from "../../../assets/applications/contractsempty.svg";
import "../../../common/empty.css";
import add from "../../../assets/addwhite.svg";
import RoleContext from "../../../services/roleContext/roleContext";
import { AddVendor } from "./AddVendor";

export function EmptyVendors(props) {
    const { isViewer } = useContext(RoleContext);
    const [addVendorOpen, setAddVendorOpen] = useState(false);

    const closeAddVendor = () => {
        setAddVendorOpen(false);
    };

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ margin: "auto" }}
        >
            <img src={empty} width={200} />
            <div className="empty-header">No vendors added</div>
            {!isViewer && (
                <Fragment>
                    <div className="empty-lower">Add vendors</div>
                    <button
                        color="primary"
                        className="ov__button2 empty-page-button"
                        style={{ width: "max-content" }}
                        onClick={() => setAddVendorOpen(true)}
                    >
                        <img style={{ paddingRight: "5px" }} src={add} />
                        Add Vendors
                    </button>
                </Fragment>
            )}
            {addVendorOpen && (
                <>
                    <div className="modal-backdrop show"></div>
                    <div style={{ display: "block" }} className="modal"></div>
                    <AddVendor
                        show={addVendorOpen}
                        onHide={closeAddVendor}
                        onSuccess={() => props.refreshTable(true)}
                    />
                </>
            )}
        </div>
    );
}
