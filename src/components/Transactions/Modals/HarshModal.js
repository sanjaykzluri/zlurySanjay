import React, { useState, useDebugValue, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchUnrecognisedTransactions } from "../../../actions/transactions-action";
import { defaults } from "../../../constants";
import svg1 from "./HarshModal.svg";
import { useDispatch, useSelector } from "react-redux";
import { Form, Modal, Row, Col } from "react-bootstrap";
import "./AddTransactionModal.scss";

import close from "../../../assets/close.svg";

import "./HarshModal.css";

export function HarshModal(props) {
	return (
		<Modal
			show={props.isOpen}
			onHide={props.handleClose}
			size="xl"
			centered
		>
			<div className="wfm__cont__new">
				<div className="wfm__cont__d1__new">
					<img alt="Close" onClick={props.handleClose} src={close} />
				</div>
				<img src={svg1}></img>
				<div className="wfm__cont__new__d2">
					An error occured while connecting with Google
				</div>
				<div className="wfm__cont__new__d3">
					Would you like to retry?
				</div>
				<button className="wfm__cont__new__d4">Retry</button>
			</div>
		</Modal>
	);
}

WorkFlowModalins.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
};
