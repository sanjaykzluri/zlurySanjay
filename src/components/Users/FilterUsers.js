import React, { Component } from "react";
import { Form, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import "./Users.css";
import close from "../../assets/close.svg";

export default class FilterUsers extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: "Application",
			display: false,
			options: [],
			showHide: false,
		};
	}

	handleSubmit(event) {
		event.preventDefault();
	}

	render() {
		return (
			<>
				<div
					show={this.props.show}
					onHide={this.props.onHide}
					className="addFiltersModal__TOP"
					style={{ height: "100vh" }}
				>
					<div className="filter__d1">
						<div className="filter__d1__text">Filters</div>
						<img
							alt="Close"
							onClick={this.props.onHide}
							src={close}
							style={{ marginLeft: "", paddingRight:"20px" }}
						/>
					</div>
					<hr style={{ margin: "0px 10px" }} />
					<div className="filter__d2">
						<Form>
							<Form.Group>
								<Form.Label bsPrefix="filter__label">
									Financial Year
								</Form.Label>
								<Form.Control
									bsPrefix="filter__control"
									style={{ width: "100%" }}
									as="select"
									placeholder="FinancialYear"
								>
									<option>2017</option>
									<option>2018</option>
									<option>2019</option>
									<option>2020</option>
								</Form.Control>
							</Form.Group>
							<Form.Group>
								<Form.Label bsPrefix="filter__label">
									Status
								</Form.Label>
								<Form.Control
									bsPrefix="filter__control"
									style={{ width: "100%" }}
									as="select"
									placeholder="FinancialYear"
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label bsPrefix="filter__label">
									Department
								</Form.Label>
								<Form.Control
									bsPrefix="filter__control"
									style={{ width: "100%" }}
									as="select"
									placeholder="FinancialYear"
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label bsPrefix="filter__label">
									Select All
								</Form.Label>
								<Form.Control
									bsPrefix="filter__control"
									style={{ width: "100%" }}
									as="select"
									placeholder="FinancialYear"
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label bsPrefix="filter__label">
									Usage
								</Form.Label>
								<Form.Control
									bsPrefix="filter__control"
									style={{ width: "100%" }}
									as="select"
									placeholder="FinancialYear"
								/>
							</Form.Group>
						</Form>
					</div>
					<hr className="filter__hr" />
					<div className="addAppsModal__footer">
						<button
							className="btn btn-link"
							onClick={this.props.onHide}
							style={{marginRight: "auto"}}
						>
							Cancel
						</button>
						<Button
							onClick={this.props.onHide}
							style={{ marginRight: "20px", marginLeft: "auto" }}
						>
							Apply Filters
						</Button>
					</div>
				</div>
			</>
		);
	}
}

FilterUsers.propTypes = {
	onShow: PropTypes.func,
	onHide: PropTypes.func,
};
