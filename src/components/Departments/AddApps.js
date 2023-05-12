import React, { Component, useState, useEffect, useRef } from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import "./AllApps.css";
import close from "../../../assets/close.svg";
import adobe from "../../../assets/transactions/adobe.svg";
class SuggestionBar extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<>
				<div className="SuggestionBardiv">
					<div className="SuggestionBardiv__div1">
						<Button
							variant="link"
							className="SuggestionBar__button"
							onClick={() => {
								this.props.datadata.update(true);
								this.props.onHide();
							}}
						>
							Add New Application
						</Button>
					</div>
				</div>
			</>
		);
	}
}
export class AddApps extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: "Application",
			display: false,
			options: [],
			showHide: false,
		};
		this.handleChange = this.handleChange.bind(this);
	}
	update(value) {
		return () => {
			this.setState({
				display: value,
			});
		};
	}

	handleSubmit(event) {
		event.preventDefault();
	}
	handleChange(event) {
		this.setState({ value: event.target.value });
		if (event.target.value.length > 0) {
			this.setState({ showHide: true });
		} else {
			this.setState({ showHide: false });
		}
	}
	render() {
		let addCardClose = () => this.setState({ showHide: false });
		return (
			<>
				<div
					show={this.props.show}
					onHide={this.props.onHide}
					className="addContractModal__TOP"
					style={{ height: "100%" }}
				>
					<div
						className="d-flex flex-row  align-items-center"
						style={{ marginTop: "24px" }}
					>
						<div style={{ marginLeft: "180px" }}>
							<span className="contracts__heading">
								Add Application
							</span>
						</div>
						<img
							alt="Close"
							onClick={this.props.onHide}
							src={close}
							style={{ marginLeft: "150px" }}
						/>
					</div>
					<hr
						style={{
							marginBottom: "0px",
							marginLeft: "6px",
							marginRight: "6px",
						}}
					/>
					<div>
						<div className="allapps__uppermost">
							<Form style={{ width: "100%" }}>
								<Form.Group
									style={{
										margin: "12px auto",
										width: "80%",
										fontSize: "12px",
									}}
								>
									<Form.Label>Select Application</Form.Label>
									<Form.Control
										style={{ width: "100%" }}
										type="text"
										placeholder="Application"
										value={this.state.value}
										onChange={this.handleChange}
									/>
								</Form.Group>
							</Form>
							{this.state.showHide ? (
								<SuggestionBar
									show={this.state.showHide}
									onHide={addCardClose}
									datadata={{
										display: this.state.display,
										update: this.update.bind(this),
									}}
								></SuggestionBar>
							) : null}
						</div>
						<div className="addContractModal__body_upper">
							<div className="addContractModal__body_upper_inner">
								{this.state.display ? (
									<div>adadawd</div>
								) : (
									null
								)}
							</div>
						</div>
						<div className="addContractModal__body_lower"></div>
					</div>
					<hr className="addApps__foothr" />
					<div className="addAppsModal__footer">
						<button
							className="btn btn-link"
							onClick={this.props.onHide}
						>
							Cancel
						</button>
						<Button
							onClick={this.props.onHide}
							style={{ marginRight: "40px" }}
						>
							Add Application
						</Button>
					</div>
				</div>
			</>
		);
	}
}
