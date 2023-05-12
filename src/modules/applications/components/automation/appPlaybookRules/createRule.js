import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	Accordion,
	Card,
	useAccordionToggle,
	AccordionContext,
} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import close from "assets/close.svg";
import "./appPlaybookRules.css";
import { trackActionSegment } from "modules/shared/utils/segment";
import AutomationRuleBuilder from "./AutomationRuleBuilder/AutomationRuleBuilder";
import DepartmentTags from "./DepartmentSelect/DepartmentSelect";
import Tags from "./TagSelect/TagSelect";
import RightArrow from "assets/icons/arrow-right.svg";
import DownArrow from "assets/getting_started/down_arrow.svg";
import { createRule } from "../service/automation-api";
import {
	updateAutomationRule,
	getAppRule,
	resetAppRule,
} from "../redux/action";
import AutomationRuleName from "./AutomationRuleName/AutomationRuleName";

function Toggle({ children, eventKey, callback, className, isCompleted }) {
	const currentEventKey = useContext(AccordionContext);

	const decoratedOnClick = useAccordionToggle(
		eventKey,
		() => callback && callback(eventKey)
	);
	const isActive = currentEventKey === eventKey;

	return (
		<div
			className={`${className} cursor-pointer`}
			onClick={!isCompleted ? decoratedOnClick : () => null}
		>
			{children(isActive)}
		</div>
	);
}

export function CreateRule({ isOpen, handleClose, modalProps }) {
	const {
		onCloseModal,
		folderType,
		entity,
		showEdit,
		setShowEdit,
		setSaveRule,
		handleRefreshTable,
		application,
	} = modalProps;
	const [tags, setTags] = useState("");
	const [description, setDescription] = useState("");
	const [department_tags, setDepartmentTags] = useState([]);
	const [btnLoading, setBtnLoading] = useState(false);
	const [rule, setRule] = useState(null);

	const getDefaultRuleFormError = () => {
		return {
			whenError: {
				error: false,
				message: "Setup a trigger to save this rule",
			},
			thenrror: {
				error: false,
				message: "Choose a trigger first",
			},
		};
	};
	const [ruleFormErrors, setRuleFormErrors] = useState(
		getDefaultRuleFormError()
	);

	const dispatch = useDispatch();
	const existingRule = useSelector((state) => state.appRule?.rule);

	useEffect(() => {
		async function createAppRule() {
			let res = {};
			if (!rule) {
				res = await createRule(folderType, entity);
				res.id = res._id;
			} else {
				res = rule;
			}
			setRule(res);
			dispatch(getAppRule(res?.id));
			setShowEdit(true);
		}
		!showEdit && createAppRule();
	}, [folderType]);

	useEffect(() => {
		showEdit && setRule(existingRule);
	}, [existingRule]);

	useEffect(() => {
		if (existingRule?.audit_log_event) {
			setRule(existingRule);
		}
	}, [existingRule?.audit_log_event]);

	useEffect(() => {
		if (rule?.id) {
			const deptags = [];
			rule?.mini_playbook_data?.org_department_tags?.map((dt) => {
				deptags.push({
					department_name: dt.name,
					department_id: dt._id,
				});
			});
			setDepartmentTags(deptags);
			setTags(rule?.mini_playbook_data?.tags || []);
			setDescription(rule?.description || "");
		}
	}, [rule?.id]);

	const handleChange = (e, target) => {
		if (target === "tags") {
			setTags(e.target.value);
		}
		if (target === "department_tags") {
			setDepartmentTags([...department_tags, e.target.value]);
		}
		if (target === "description") {
			setDescription(e.target.value);
		}
	};

	const validateRuleForm = () => {
		let formValid = true;
		if (!rule?.audit_log_event) {
			setRuleFormErrors({
				...ruleFormErrors,
				whenError: { ...ruleFormErrors.whenError, error: true },
			});
			formValid = false;
		}
		return formValid;
	};

	const saveAppRule = () => {
		setBtnLoading(true);
		trackActionSegment(
			"Clicked on Save Rule Button in Automation Rules Section",
			{ rule: rule }
		);
		if (validateRuleForm()) {
			rule.mini_playbook_data = {
				...rule?.mini_playbook_data,
				tags,
				department_tags: department_tags.map(
					(dept) => dept?.department_id
				),
			};
			const ruleData = { ...rule, description };
			if (!ruleData.showNotifyUsers) {
				ruleData.notifyUsers = [];
			}
			if (ruleData?.events?.[0]?.type === "auto_rejection") {
				ruleData.approvers = [];
			}
			dispatch(updateAutomationRule(ruleData));
			dispatch(resetAppRule());
			setSaveRule(true);
			setBtnLoading(false);
			onCloseModal();
			handleClose();
			handleRefreshTable();
		}
	};

	return (
		<Modal
			show={isOpen}
			backdrop="static"
			dialogClassName="app-rule-modal"
			contentClassName="content_class"
			onHide={() => {
				onCloseModal();
				handleClose();
			}}
		>
			<Modal.Body>
				<div
					className="d-flex flex-column"
					style={{
						height: "100%",
						background: "#FAFBFF",
						borderRadius: "8px",
					}}
				>
					<div
						className="d-flex"
						style={{
							padding: "14px 24px",
							justifyContent: "space-between",
						}}
					>
						<div>
							<AutomationRuleName />
						</div>
						<div>
							<img
								className="cursor-pointer"
								alt="Close"
								onClick={() => {
									onCloseModal();
									handleClose();
									handleRefreshTable();
								}}
								src={close}
								width="16px"
								height="16px"
							/>
						</div>
					</div>
					<hr style={{ margin: "0px" }} />
					<div className="d-flex flex-row" style={{ height: "100%" }}>
						<div
							className="d-flex flex-column"
							style={{
								width: "100%",
								background: "#FAFBFF",
								paddingLeft: "12px",
							}}
						>
							<AutomationRuleBuilder
								rule={rule}
								workflowType={folderType}
								application={application}
								ruleFormErrors={ruleFormErrors}
								setRuleFormErrors={setRuleFormErrors}
							/>
							<div>
								<Accordion>
									<Card
										style={{
											background: "#FAFBFF",
											border: "none",
										}}
									>
										<Card.Header className="additional-setting-name">
											ADDITIONAL SETTINGS
											<Toggle
												eventKey="0"
												className="gettingstarted__item__toggle"
											>
												{(isActive) => (
													<div className="gettingstarted__item__toggle-right__section">
														<img
															src={
																isActive
																	? DownArrow
																	: RightArrow
															}
															style={{
																marginLeft:
																	"12px",
																marginTop:
																	"-1px",
															}}
														/>
													</div>
												)}
											</Toggle>
										</Card.Header>
										<Accordion.Collapse eventKey="0">
											<Card.Body>
												<div
													className="d-flex justify-content-between"
													style={{
														fontWeight: 600,
														fontSize: "12px",
														color: "#484848",
													}}
												>
													<Form.Group
														style={{ width: "30%" }}
													>
														<Form.Label
															htmlFor="folderType"
															className="additional-setting-label"
														>
															Folder Type
														</Form.Label>
														<Form.Control
															type="text"
															value={folderType}
															disabled
														/>
													</Form.Group>
													<Form.Group
														className="mb-3"
														style={{ width: "30%" }}
													>
														<Form.Label htmlFor="Departmenttags">
															Department
														</Form.Label>
														<DepartmentTags
															department_tags={
																department_tags
															}
															setDepartmentTags={
																setDepartmentTags
															}
														/>
													</Form.Group>
													<Form.Group
														className="mb-4"
														style={{ width: "30%" }}
													>
														<Form.Label htmlFor="tags">
															Tags
														</Form.Label>
														<Tags
															tags={tags}
															setTags={setTags}
														/>
													</Form.Group>
												</div>

												<Form.Group
												// style={{
												// 	marginTop: "84px",
												// }}
												>
													<Form.Label
														htmlFor="description"
														className="additional-setting-label"
													>
														Description
													</Form.Label>
													<Form.Control
														style={{
															height: "66px",
														}}
														as="textarea"
														rows={3}
														placeholder="Add description"
														value={description}
														onChange={(e) =>
															handleChange(
																e,
																"description"
															)
														}
													/>
												</Form.Group>
											</Card.Body>
										</Accordion.Collapse>
									</Card>
								</Accordion>
							</div>
						</div>

						<div
							style={{
								background: "#EAECF2",
								opacity: 0.5,
								width: "0%",
							}}
						></div>
					</div>
					<hr style={{ margin: "0px" }} />
					<div className="d-flex justify-content-end align-items-end p-3">
						<button
							className="btn btn-primary"
							onClick={saveAppRule}
						>
							Save Rule
						</button>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
}
