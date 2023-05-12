import React, { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Modal, Row, Col, Spinner } from "react-bootstrap";
import "./AddDepartment.scss";
import close from "../../assets/close.svg";
import Button from "react-bootstrap/Button";
import { debounce } from "../../utils/common";
import { searchUsers } from "../../services/api/search";
import { Loader } from "../../common/Loader/Loader";
import { useDidUpdateEffect } from "../../utils/componentUpdateHook";
import { CUSTOM_FIELD_ENTITY } from "../../modules/custom-fields/constants/constant";
import { CustomFieldSectionInForm } from "../../modules/shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { client } from "../../utils/client";
import { useDispatch, useSelector } from "react-redux";
function SuggestionMenu(props) {
	return (
		<div className="SuggestionBardiv__TM shadow-sm">
			{props.loading ? (
				<div className="option__card__WFM">
					<Loader height={60} width={60} />
				</div>
			) : (
				props.options.map((option, index) => (
					<>
						<button
							className="suggestion-item"
							onClick={() => props.onSelect(option)}
						>
							<img
								src={`https://ui-avatars.com/api/?name=${option.user_name}`}
								style={{
									height: "24px",
									width: "24px",
									marginRight: "10px",
								}}
							></img>
							{option.user_name}
						</button>
						{!(index == props.options.length - 1) ? (
							<hr style={{ margin: "0px 18px" }}></hr>
						) : null}
					</>
				))
			)}
			{!props.loading && props.options.length == 0 && (
				<span className="option__card__WFM">No users found.</span>
			)}
		</div>
	);
}

export function AddDepartment(props) {
	const defaultDepartment = {
		department_name: "",
		department_head: "",
		department_image: "img1", // FIXME: Passing dummy string as image path for now
		department_budget: null,
		department_custom_fields: [],
	};
	const [department, setDepartment] = useState({ ...defaultDepartment });
	const [suggestionsLoading, setSuggestionsLoading] = useState(true);
	const [showSuggestions, setShowSuggestionsMenu] = useState(false);
	const [suggestions, setSuggestions] = useState([]);
	const [departmentHead, setDepartmentHead] = useState("");
	const [validation, setValidation] = useState({});
	const cancelToken = useRef();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		//Segment Implementation
		window.analytics.page(
			"Departments",
			"All-Departments; Add-New-Department",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);

	const validateField = (fieldName, value) => {
		if (!value) {
			setValidation({
				...validation,
				...{ [fieldName]: { msg: `Please enter ${fieldName}` } },
			});
		} else if (validation[fieldName]) {
			delete validation[fieldName];
			setValidation({ ...validation });
		}
	};

	const handleEdit = (key, value) => {
		if (key === "department_name") {
			props.setDeptNameExists && props.setDeptNameExists(false);
		}
		value = value?.trimStart();
		validateField(key, value);
		let departmentObj = { ...department, [key]: value };
		setDepartment(departmentObj);
	};

	const handleDepartmentHeadChange = (value) => {
		value = value?.trimStart();
		setDepartmentHead(value);
		if (value && value.length > 0) {
			setSuggestionsLoading(true);
			setShowSuggestionsMenu(true);
		} else {
			setShowSuggestionsMenu(false);
			setSuggestionsLoading(false);
			handleEdit("department_head", "");
		}
	};

	const handleDepartmentHeadSelect = (option) => {
		setDepartmentHead(option.user_name);
		handleEdit("department_head", option.user_id);
		setShowSuggestionsMenu(false);
	};

	const generateSuggestions = useCallback(
		debounce((query) => {
			if (query && query.length >= 1) {
				cancelToken.current = client.CancelToken.source();
				searchUsers(query, cancelToken, true).then((res) => {
					setSuggestions(res.results);
					setSuggestionsLoading(false);
				});
			}
		}, 300),
		[]
	);

	const isInvalid = (fieldName) => !!validation[fieldName]?.msg;

	useDidUpdateEffect(() => {
		generateSuggestions(departmentHead);
	}, [departmentHead]);

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		const state = { ...department };
		const index = state["department_custom_fields"].findIndex(
			(cf) => cf.field_id === id
		);
		state["department_custom_fields"].splice(index, index > -1 ? 1 : 0, {
			field_id: id,
			field_value: val,
		});
		setDepartment(state);
	};

	const validateDepartment = (department) => {
		const requiredFields = [
			"department_name",
			"department_head",
			"department_budget",
		];
		const errors = {};
		requiredFields.forEach((fieldName) => {
			if (!department[fieldName]) {
				errors[fieldName] = {
					msg: `Please enter ${fieldName}`,
				};
			}
		});
		return errors;
	};

	const handleSubmit = () => {
		if (department) {
			let errors = validateDepartment(department);
			if (Object.keys(errors).length > 0) {
				setValidation(errors);
				return;
			}
		}
		props.handleSubmit(department);
		//Segment Implementation
		window.analytics.track("Added a new Department", {
			newDeptName: department.department_name,
			newDeptHead: department.department_head,
			newDeptBudget: department.department_budget,
			newDeptImg: department.department_image,
			currentCategory: "Departments",
			currentPageName: "All-Departments",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};

	return (
		<Modal
			centered
			show={props.isOpen}
			onHide={props.handleClose}
			onClick={() => setShowSuggestionsMenu(false)}
		>
			<Modal.Header closeButton={false}>
				<Modal.Title style={{ fontWeight: "600" }}>
					Add New Department
				</Modal.Title>
				<img alt="Close" onClick={props.handleClose} src={close} />
			</Modal.Header>
			<hr />
			<Modal.Body>
				<div className="addTransactionModal__body_upper">
					<div className="addTransactionModal__body_upper_inner">
						<Form style={{ width: "100%" }}>
							<Form.Group>
								<Form.Label style={{ opacity: 0.8 }}>
									Name
								</Form.Label>
								<Form.Control
									type="text"
									placeholder="Department"
									value={department.department_name}
									isInvalid={
										isInvalid("department_name") ||
										props.deptNameExists
									}
									onChange={(e) =>
										handleEdit(
											"department_name",
											e.target.value
										)
									}
								/>
								<Form.Control.Feedback type="invalid">
									{props.deptNameExists
										? "Department with this name already exists."
										: "Please enter the department name."}
								</Form.Control.Feedback>
							</Form.Group>
						</Form>
					</div>
				</div>
				<div className="addTransactionModal__body_lower">
					<div className="addTransactionModal__body_lower_inner">
						<Form style={{ width: "100%", marginBottom: "64px" }}>
							<Row>
								<Col>
									<Form.Group>
										<Form.Label style={{ opacity: 0.8 }}>
											Head
										</Form.Label>
										<Form.Control
											type="text"
											placeholder="Head"
											value={departmentHead}
											isInvalid={isInvalid(
												"department_head"
											)}
											onChange={(e) =>
												handleDepartmentHeadChange(
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter the name of
											department's head
										</Form.Control.Feedback>
									</Form.Group>
									{showSuggestions && (
										<div style={{ position: "relative" }}>
											<SuggestionMenu
												loading={suggestionsLoading}
												options={suggestions}
												onSelect={
													handleDepartmentHeadSelect
												}
											/>
										</div>
									)}
								</Col>
							</Row>
							<Row>
								<Col>
									<Form.Group>
										<Form.Label style={{ opacity: 0.8 }}>
											Budget
										</Form.Label>
										<Form.Control
											type="number"
											placeholder="Budget"
											value={department.department_budget}
											isInvalid={isInvalid(
												"department_budget"
											)}
											onChange={(e) =>
												handleEdit(
													"department_budget",
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter department's budget
										</Form.Control.Feedback>
									</Form.Group>
								</Col>
							</Row>
							<CustomFieldSectionInForm
								customFieldData={
									department.department_custom_fields
								}
								of={CUSTOM_FIELD_ENTITY.DEPARTMENTS}
								onValueChange={(id, val) =>
									onValueChangeFromCustomFields(id, val)
								}
							/>
						</Form>
					</div>
				</div>
			</Modal.Body>
			<hr />
			<Modal.Footer className="addTransactionModal__footer">
				<button className="btn btn-link" onClick={props.handleClose}>
					Cancel
				</button>
				<Button
					onClick={handleSubmit}
					disabled={props.submitInProgress}
				>
					Add Department
					{props.submitInProgress && (
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
			</Modal.Footer>
		</Modal>
	);
}

AddDepartment.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	submitInProgress: PropTypes.bool,
	validationErrors: PropTypes.array,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};
