import React, { useEffect, useState } from "react";
import { Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import close from "../../assets/close.svg";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import { AsyncTypeahead } from "../../common/Typeahead/AsyncTypeahead";
import { searchUsers } from "../../services/api/search";
import { CustomFieldSectionInForm } from "../../modules/shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { CUSTOM_FIELD_ENTITY } from "../../modules/custom-fields/constants/constant";
import { useDispatch, useSelector } from "react-redux";
import { allowDigitsOnly } from "utils/common";
export function EditDepartment(props) {
	const defaultDepartment = {
		department_id: "",
		department_name: "",
		department_head: "",
		department_image: "img1", // FIXME: Passing dummy string as image path for now
		department_budget: null,
		department_custom_fields: [],
	};
	const [department, setDepartment] = useState({ ...defaultDepartment });
	const [departmentHead, setDepartmentHead] = useState("");
	const [validation, setValidation] = useState({});

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
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		if (props.department) {
			const { department } = props;
			const { department_head } = department;
			setDepartment({
				...defaultDepartment,
				department_id: department.department_id,
				department_head: department_head ? department_head.user_id : "",
				department_name: department.department_name,
				department_budget: department.department_budget_total,
				department_custom_fields:
					department.department_custom_fields || [],
			});
			setDepartmentHead(department_head ? department_head.user_name : "");
		}
	}, [props.department]);

	const handleEdit = (key, value) => {
		value = value?.trimStart();
		validateField(key, value);
		let departmentObj = { ...department, [key]: value };
		setDepartment(departmentObj);
	};

	const handleEdit2 = (key, value) => {
		validateField(key, value);
		let departmentObj = { ...department, [key]: value };
		setDepartment(departmentObj);
	};

	const isInvalid = (fieldName) => !!validation[fieldName]?.msg;

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

	const handleSubmit = (department) => {
		let errors = validateDepartment(department);
		if (Object.keys(errors).length > 0) {
			setValidation(errors);
			return;
		}
		props.handleSubmit(department);
	};

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		const customFields = [...department.department_custom_fields];
		const index = customFields.findIndex((cf) => cf.field_id === id);
		customFields.splice(index, index > -1 ? 1 : 0, {
			...customFields[index],
			field_id: id,
			field_value: val,
		});
		setDepartment({
			...department,
			...{ department_custom_fields: customFields },
		});
	};

	useEffect(() => {
		//Segment Implementation
		window.analytics.page(
			"Departments",
			"Department-Overview; Edit-Department",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);

	const disableEditName = props.department?.is_integration_department;
	return (
		<Modal centered show={props.isOpen} onHide={props.handleClose}>
			<Modal.Header closeButton={false}>
				<Modal.Title style={{ fontWeight: "600" }}>
					Edit Department
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
									disabled={disableEditName}
									type="text"
									placeholder="Department"
									value={department.department_name}
									isInvalid={isInvalid("department_name")}
									onChange={(e) =>
										handleEdit(
											"department_name",
											e.target.value
										)
									}
								/>
								<Form.Control.Feedback type="invalid">
									Please enter the department name
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
									<AsyncTypeahead
										label="Head"
										placeholder="Head"
										defaultValue={departmentHead}
										fetchFn={searchUsers}
										isInvalid={isInvalid("department_head")}
										invalidMessage="Please select the department head."
										onSelect={(selection) => {
											handleEdit2(
												"department_head",
												selection.user_id
											);
											setDepartmentHead(
												selection.user_name
											);
										}}
										keyFields={{
											id: "user_id",
											image: "image",
											value: "user_name",
										}}
										invalidMsgClassName={
											isInvalid("department_head")
												? "d-block"
												: null
										}
										allowFewSpecialCharacters={true}
									/>
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
											onKeyDown={allowDigitsOnly}
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
								onValueChange={(id, val) => {
									onValueChangeFromCustomFields(id, val);
								}}
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
					onClick={() => handleSubmit(department)}
					disabled={props.submitInProgress}
				>
					Save Changes
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

EditDepartment.propTypes = {
	department: PropTypes.object.isRequired,
	isOpen: PropTypes.bool.isRequired,
	submitInProgress: PropTypes.bool,
	validationErrors: PropTypes.array,
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func,
};
