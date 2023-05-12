import React from "react";
import PropTypes from "prop-types";
import svg1 from "./ErrorModal.svg";
import { Modal } from "react-bootstrap";
import close from "../../assets/close.svg";
import "./ErrorModal.css";

export function StepsErrorModal(props) {
	return (
		<Modal show={props.isOpen} onHide={props.handleClose} centered>
			<div className="wfm__cont__new">
				<div className="wfm__cont__d1__new">
					<img
						role="button"
						alt="Close"
						onClick={props.handleClose}
						src={close}
					/>
				</div>
				<img src={svg1}></img>
				<div className="wfm__cont__new__d2">
					An error occured while connecting with Google
				</div>
				<div className="wfm__cont__new__d3">
					Would you like to retry?
				</div>
				<button className="wfm__cont__new__d4" onClick={props.retry}>Retry</button>
			</div>
		</Modal>
	);
}

StepsErrorModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
};
