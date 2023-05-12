import React, { useEffect, useState } from "react";
import { Accordion, Card, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ZluriLogo from "../../assets/zluri.svg";
import CloseButton from "./close.svg";
import config from "./config";
import GettingStartedSection from "./GettingStartedSection";
import "./styles.css";
import HelpCard from "./HelpCard";
import ResourcesCard from "./ResourcesCard";
import { updateGettingStartedStatuses } from "./redux";

function GettingStartedModal(props) {

	const gettingStartedStatuses = useSelector(state => state?.gettingStartedStatuses)
	const orgId = useSelector(state => state?.userInfo?.org_id)
	const [progress, setProgress] = useState(0);
	const [completed, setCompleted] = useState(0);
	const [total, setTotal] = useState(0);
    const dispatch = useDispatch();
	useEffect(()=>{
		if(gettingStartedStatuses){
		const gettingStartedKeys = Object.keys(gettingStartedStatuses);
		const updatedTotal = Object.keys(gettingStartedStatuses).length;
		const updatedCompleted = gettingStartedKeys.filter(key => gettingStartedStatuses[key]).length;

		const updatedProgress = (updatedCompleted/updatedTotal)*100
		setTotal(updatedTotal)
		setProgress(updatedProgress);
		setCompleted(updatedCompleted)
		}
		if(orgId)
		dispatch(updateGettingStartedStatuses(orgId))
		
	}, [JSON.stringify(gettingStartedStatuses)])

	return (
		<Modal
			show={props.show && !!gettingStartedStatuses}
			dialogClassName="getting__started__modal"
			className="pl-0"
			onHide={props.onClose}
		>
			<Modal.Header
				className="getting__started__modal_header"
			>
				<div className="getting__started__modal_header__wrapper">
				<img className="align-self-end cursor-pointer" src={CloseButton} onClick={props.onClose}/>
				<div className="getting__started__modal_title mb-3">
					Getting Started with <img src={ZluriLogo} />
				</div>
				<div className="d-flex">
				<div className="getting__started__modal_progress">
					<div className="getting__started__modal_progress_completed" style={{width:`${progress}%`}}/>
					<div className="getting__started__modal_progress_remaining" />
				</div>
				<div className="ml-3">{completed}/{total} completed</div>
				</div>
				</div>
			</Modal.Header>
			<Modal.Body>
				<div className="getting__started__modalbody__wrapper">
				<div className="col-md-7">
					{Object.keys(config).map((key) => (
						<GettingStartedSection key={key} {...config[key]} gettingStartedStatuses={gettingStartedStatuses} />
					))}
				</div>
				<div className="col-md-3 offset-md-1">
					<HelpCard />
					<ResourcesCard />
				</div>
				</div>
			</Modal.Body>
		</Modal>
	);
}

export default GettingStartedModal;
