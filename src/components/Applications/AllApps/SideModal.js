import React from "react";
import close from "../../../assets/close.svg";
import greenTick from "../../../assets/green_tick.svg";
import { Col, Form, Row, Button } from "react-bootstrap";
export function SideModal(props) {
	return (
		<div
			centered
			show={props.show}
			onHide={props.onHide}
			className="sideModal__TOP h-100"
		>
			<div className="d-flex flex-row align-items-center py-4">
				<div className="m-auto">
					<span className="contracts__heading d-flex flex-row">
						{props.title}
					</span>
				</div>
				<img
					className="pr-4 cursor-pointer"
					alt="Close"
					onClick={props.onHide}
					src={close}
				/>
			</div>
			<hr className="m-0" />
			{props.showInProgressModal ? (
				<>
					<div className="sideModal__progress">
						<img
							src={greenTick}
							height="54px"
							width="54px"
							style={{ marginBottom: "10px" }}
						/>
						<h5>Your export is in progress</h5>
						<p>We'll mail you as soon as the export is complete</p>
						<Button
							onClick={() => {
								props.onHide();
							}}
						>
							Close
						</Button>
					</div>
				</>
			) : (
				<>
					<div>{props.children}</div>
					<div className="w-100 ml-4 mt-2">
						<Form.Group as={Row}>
							<Form.Label as="legend" column sm={2}>
								FILE TYPE:
							</Form.Label>
							<Col sm={10}>
								<Form.Control as="select" className="w-25 pl-1">
									<option>CSV</option>
								</Form.Control>
							</Col>
						</Form.Group>
					</div>
					<div className="sideModal__footer">
						<Button
							variant="link"
							size="sm"
							className="mr-3"
							onClick={() => props.onHide()}
						>
							Cancel
						</Button>
						<Button
							className="z-btn-primary mr-4"
							type="submit"
							onClick={props.exportData}
						>
							Export Data
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
